const { Order, CartDetail, Product, Manufacturer } = require('../models');
const { ORDER_STATUS } = require('../constants');

const getRevenue = async (query) => {
  const { startDate, endDate, filterBy = 'month' } = query;

  const matchStage = {
    status: 'success',
  };

  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    matchStage.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    matchStage.createdAt = { $lte: new Date(endDate) };
  }

  // Define group stages based on filterBy parameter
  let timeGrouping;
  let sortStage;
  let projectStage;

  if (filterBy === 'day') {
    timeGrouping = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' },
    };
    sortStage = {
      '_id.year': 1,
      '_id.month': 1,
      '_id.day': 1,
    };
    projectStage = {
      _id: 0,
      year: '$_id.year',
      month: '$_id.month',
      day: '$_id.day',
      revenue: '$revenue',
    };
  } else if (filterBy === 'week') {
    timeGrouping = {
      year: { $year: '$createdAt' },
      week: { $week: '$createdAt' },
    };
    sortStage = {
      '_id.year': 1,
      '_id.week': 1,
    };
    projectStage = {
      _id: 0,
      year: '$_id.year',
      week: '$_id.week',
      revenue: '$revenue',
    };
  } else {
    // Default: month
    timeGrouping = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
    };
    sortStage = {
      '_id.year': 1,
      '_id.month': 1,
    };
    projectStage = {
      _id: 0,
      year: '$_id.year',
      month: '$_id.month',
      revenue: '$revenue',
    };
  }

  const result = await Order.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: timeGrouping,
        revenue: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: sortStage,
    },
    {
      $project: projectStage,
    },
  ]);

  return result;
};

const getTopSellingProducts = async (query) => {
  const { startDate, endDate } = query;

  const orderMatchStage = {
    status: 'success',
  };

  if (startDate && endDate) {
    orderMatchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    orderMatchStage.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    orderMatchStage.createdAt = { $lte: new Date(endDate) };
  }

  // 1. Find successful orders within the date range
  const successfulOrders = await Order.find(orderMatchStage).select('cartDetails').lean();

  // 2. Extract all cartDetail IDs from these orders
  const cartDetailIds = successfulOrders.flatMap((order) => order.cartDetails);

  if (cartDetailIds.length === 0) {
    return []; // No products sold in this period
  }

  // 3. Aggregate CartDetail to find top selling products
  const topProducts = await CartDetail.aggregate([
    {
      $match: {
        _id: { $in: cartDetailIds }, // Filter by cartDetails from successful orders
      },
    },
    {
      $group: {
        _id: '$productId',
        totalQuantitySold: { $sum: '$quantity' },
      },
    },
    {
      $sort: { totalQuantitySold: -1 }, // Sort by quantity descending
    },
    {
      $limit: 10, // Get top 10
    },
    {
      $lookup: {
        // Join with Products collection
        from: Product.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    {
      $unwind: '$productInfo', // Deconstruct the productInfo array
    },
    {
      $project: {
        // Select and reshape final output
        _id: 0,
        productId: '$_id',
        name: '$productInfo.name',
        images: '$productInfo.images',
        // Add other product fields if needed, e.g., price
        // price: '$productInfo.price',
        totalQuantitySold: 1,
      },
    },
  ]);

  return topProducts;
};

const getBrandMarketShare = async (query) => {
  const { startDate, endDate } = query;

  // --- Find relevant CartDetail IDs (same logic as getTopSellingProducts) ---
  const orderMatchStage = { status: 'success' };
  if (startDate && endDate) {
    orderMatchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (startDate) {
    orderMatchStage.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    orderMatchStage.createdAt = { $lte: new Date(endDate) };
  }
  const successfulOrders = await Order.find(orderMatchStage).select('cartDetails').lean();
  const cartDetailIds = successfulOrders.flatMap((order) => order.cartDetails);

  if (cartDetailIds.length === 0) {
    return [];
  }
  // -----------------------------------------------------------------------

  const marketShareData = await CartDetail.aggregate([
    {
      $match: {
        _id: { $in: cartDetailIds },
      },
    },
    {
      // Lookup product to get manufacturerId
      $lookup: {
        from: Product.collection.name,
        localField: 'productId',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    {
      $unwind: '$productInfo',
    },
    {
      // Group by manufacturer to sum quantities
      $group: {
        _id: '$productInfo.manufacturerId',
        totalQuantitySold: { $sum: '$quantity' },
      },
    },
    {
      // Calculate total quantity sold across all brands in this period
      $group: {
        _id: null,
        totalOverallQuantity: { $sum: '$totalQuantitySold' },
        brandsData: { $push: { manufacturerId: '$_id', totalQuantitySold: '$totalQuantitySold' } },
      },
    },
    {
      // Unwind the brandsData array to process each brand
      $unwind: '$brandsData',
    },
    {
      // Calculate market share percentage
      $project: {
        _id: 0,
        manufacturerId: '$brandsData.manufacturerId',
        totalQuantitySold: '$brandsData.totalQuantitySold',
        marketSharePercentage: {
          $multiply: [{ $divide: ['$brandsData.totalQuantitySold', '$totalOverallQuantity'] }, 100],
        },
      },
    },
    {
      // Lookup manufacturer details
      $lookup: {
        from: Manufacturer.collection.name,
        localField: 'manufacturerId',
        foreignField: '_id',
        as: 'manufacturerInfo',
      },
    },
    {
      $unwind: '$manufacturerInfo',
    },
    {
      // Final projection
      $project: {
        manufacturerId: 1,
        name: '$manufacturerInfo.name',
        logo: '$manufacturerInfo.logo', // Add logo or other fields if needed
        totalQuantitySold: 1,
        marketSharePercentage: 1,
      },
    },
    {
      // Sort by market share descending
      $sort: { marketSharePercentage: -1 },
    },
  ]);

  return marketShareData;
};

const getProductDistribution = async (query) => {
  const { startDate, endDate } = query;

  // --- Find relevant CartDetail IDs (same logic as before) ---
  const orderMatchStage = { status: 'success' };
  if (startDate && endDate) {
    orderMatchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (startDate) {
    orderMatchStage.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    orderMatchStage.createdAt = { $lte: new Date(endDate) };
  }
  const successfulOrders = await Order.find(orderMatchStage).select('cartDetails').lean();
  const cartDetailIds = successfulOrders.flatMap((order) => order.cartDetails);

  if (cartDetailIds.length === 0) {
    return {
      totalSold: 0,
      topProducts: [],
      othersPercentage: 0,
    };
  }
  // -----------------------------------------------------------------------

  // 1. First, get total quantity sold across all products
  const totalResult = await CartDetail.aggregate([
    {
      $match: { _id: { $in: cartDetailIds } },
    },
    {
      $group: {
        _id: null,
        totalSold: { $sum: '$quantity' },
      },
    },
  ]);

  const totalSold = totalResult.length > 0 ? totalResult[0].totalSold : 0;

  if (totalSold === 0) {
    return {
      totalSold: 0,
      topProducts: [],
      othersPercentage: 0,
    };
  }

  // 2. Get top 10 products with their quantities
  const topProductsData = await CartDetail.aggregate([
    {
      $match: { _id: { $in: cartDetailIds } },
    },
    {
      $group: {
        _id: '$productId',
        quantitySold: { $sum: '$quantity' },
      },
    },
    {
      $sort: { quantitySold: -1 },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: Product.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    {
      $unwind: '$productInfo',
    },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        name: '$productInfo.name',
        images: '$productInfo.images',
        quantitySold: 1,
        percentage: {
          $multiply: [{ $divide: ['$quantitySold', totalSold] }, 100],
        },
      },
    },
  ]);

  // 3. Calculate total quantity of top 10 products
  const topProductsTotal = topProductsData.reduce((sum, product) => sum + product.quantitySold, 0);

  // 4. Calculate percentage of "Others" (all products not in top 10)
  const othersPercentage = ((totalSold - topProductsTotal) / totalSold) * 100;

  return {
    totalSold,
    topProducts: topProductsData,
    othersPercentage,
  };
};

module.exports = {
  getRevenue,
  getTopSellingProducts,
  getBrandMarketShare,
  getProductDistribution,
};
