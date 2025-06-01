const mongoose = require('mongoose');
const { Order, CartDetail, Product, Manufacturer, Comment } = require('../models');
const { ORDER_STATUS } = require('../constants');

/**
 * Helper function to generate period information based on filter type
 * @param {string} filterBy - The filter type ('day', 'week', 'month', 'year')
 * @param {string} startDate - Optional explicit start date
 * @param {string} endDate - Optional explicit end date
 * @returns {Object} Period information object
 */
const getFilterPeriodInfo = (filterBy, startDate, endDate) => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // If explicit date range is provided, use it
  if (startDate && endDate) {
    return {
      filterBy,
      startDate,
      endDate,
      isCustomRange: true,
    };
  }

  // Otherwise, calculate based on filterBy
  let periodStart, periodEnd;

  switch (filterBy) {
    case 'day':
      // Today's data
      periodStart = new Date(today);
      periodEnd = new Date(now);
      break;

    case 'week':
      // One week from today
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - 7);
      periodEnd = new Date(now);
      break;

    case 'month':
      // One month from today
      periodStart = new Date(now);
      periodStart.setMonth(now.getMonth() - 1);
      periodEnd = new Date(now);
      break;

    case 'year':
      // One year from today
      periodStart = new Date(now);
      periodStart.setFullYear(now.getFullYear() - 1);
      periodEnd = new Date(now);
      break;

    default:
      periodStart = new Date(today);
      periodEnd = new Date(now);
  }

  return {
    filterBy,
    startDate: periodStart.toISOString().split('T')[0],
    endDate: periodEnd.toISOString().split('T')[0],
    isCustomRange: false,
  };
};

const getRevenue = async (query) => {
  const { startDate, endDate, filterBy = 'month' } = query;
  const now = new Date();

  // Set up date filters based on filterBy parameter
  const matchStage = {
    status: 'success',
  };

  if (startDate && endDate) {
    // If explicit date range is provided, use it
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    // Otherwise, apply automatic date ranges based on filterBy
    if (filterBy === 'day') {
      // Last 14 days
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(now.getDate() - 14);
      matchStage.createdAt = { $gte: fourteenDaysAgo };
    } else if (filterBy === 'week') {
      // Last 8 weeks
      const eightWeeksAgo = new Date();
      eightWeeksAgo.setDate(now.getDate() - 8 * 7);
      matchStage.createdAt = { $gte: eightWeeksAgo };
    } else if (filterBy === 'month') {
      // Last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(now.getMonth() - 12);
      matchStage.createdAt = { $gte: twelveMonthsAgo };
    } else if (filterBy === 'year') {
      // Last 5 years
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(now.getFullYear() - 5);
      matchStage.createdAt = { $gte: fiveYearsAgo };
    }
  }

  // Define time grouping and additional stages based on filterBy
  let timeGrouping;
  let sortStage;
  let projectStage;
  const additionalStages = [];

  if (filterBy === 'day') {
    timeGrouping = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' },
      date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
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
      date: '$_id.date',
      revenue: '$revenue',
      profit: '$profit',
      // Format date as day/month/year
      formattedDate: {
        $concat: [{ $toString: '$_id.day' }, '/', { $toString: '$_id.month' }, '/', { $toString: '$_id.year' }],
      },
    };
    // Add a stage to get the first date for each group
    additionalStages.push({
      $group: {
        _id: {
          year: '$_id.year',
          month: '$_id.month',
          day: '$_id.day',
          date: '$_id.date',
        },
        revenue: { $first: '$revenue' },
        profit: { $first: '$profit' },
        firstDate: { $first: '$createdAt' },
      },
    });
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
      profit: '$profit',
      // Calculate start and end dates for each week
      startDate: '$weekStart',
      endDate: '$weekEnd',
      // Format date range as day/month/year - day/month/year
      formattedDate: {
        $concat: [
          { $substr: ['$weekStart', 8, 2] },
          '/',
          { $substr: ['$weekStart', 5, 2] },
          '/',
          { $substr: ['$weekStart', 0, 4] },
          ' - ',
          { $substr: ['$weekEnd', 8, 2] },
          '/',
          { $substr: ['$weekEnd', 5, 2] },
          '/',
          { $substr: ['$weekEnd', 0, 4] },
        ],
      },
    };
    // Add stages to calculate week start and end dates
    additionalStages.push({
      $group: {
        _id: {
          year: '$_id.year',
          week: '$_id.week',
        },
        revenue: { $first: '$revenue' },
        profit: { $first: '$profit' },
        minDate: { $min: '$createdAt' },
        maxDate: { $max: '$createdAt' },
      },
    });
    additionalStages.push({
      $addFields: {
        weekStart: { $dateToString: { format: '%Y-%m-%d', date: '$minDate' } },
        weekEnd: { $dateToString: { format: '%Y-%m-%d', date: '$maxDate' } },
      },
    });
  } else if (filterBy === 'year') {
    timeGrouping = {
      year: { $year: '$createdAt' },
    };
    sortStage = {
      '_id.year': 1,
    };
    projectStage = {
      _id: 0,
      year: '$_id.year',
      revenue: '$revenue',
      profit: '$profit',
      // Add year start and end dates
      startDate: {
        $dateToString: { format: '%Y-%m-%d', date: { $dateFromParts: { year: '$_id.year', month: 1, day: 1 } } },
      },
      endDate: {
        $dateToString: { format: '%Y-%m-%d', date: { $dateFromParts: { year: '$_id.year', month: 12, day: 31 } } },
      },
      // Format date as year
      formattedDate: { $toString: '$_id.year' },
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
      profit: '$profit',
      // Calculate month start and end dates
      startDate: {
        $dateToString: {
          format: '%Y-%m-%d',
          date: { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: 1 } },
        },
      },
      endDate: {
        $dateToString: {
          format: '%Y-%m-%d',
          date: {
            $dateFromParts: {
              year: {
                $cond: {
                  if: { $eq: ['$_id.month', 12] },
                  then: { $add: ['$_id.year', 1] },
                  else: '$_id.year',
                },
              },
              month: {
                $cond: {
                  if: { $eq: ['$_id.month', 12] },
                  then: 1,
                  else: { $add: ['$_id.month', 1] },
                },
              },
              day: 1,
            },
          },
        },
      },
      // Format date as month/year
      formattedDate: {
        $concat: [{ $toString: '$_id.month' }, '/', { $toString: '$_id.year' }],
      },
    };
    // Add a stage to calculate the last day of each month
    additionalStages.push({
      $addFields: {
        endDate: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $subtract: [
                {
                  $dateFromParts: {
                    year: {
                      $cond: { if: { $eq: ['$_id.month', 12] }, then: { $add: ['$_id.year', 1] }, else: '$_id.year' },
                    },
                    month: { $cond: { if: { $eq: ['$_id.month', 12] }, then: 1, else: { $add: ['$_id.month', 1] } } },
                    day: 1,
                  },
                },
                { $literal: 24 * 60 * 60 * 1000 }, // Subtract one day (in milliseconds)
              ],
            },
          },
        },
      },
    });
  }

  // Build the aggregation pipeline
  const pipeline = [
    { $match: matchStage },
    // Lookup cart details to get product information
    {
      $lookup: {
        from: 'cartdetails',
        localField: 'cartDetails',
        foreignField: '_id',
        as: 'cartDetailsData',
      },
    },
    // Unwind the cartDetailsData array
    { $unwind: '$cartDetailsData' },
    // Lookup products to get cost price
    {
      $lookup: {
        from: 'products',
        localField: 'cartDetailsData.productId',
        foreignField: '_id',
        as: 'productData',
      },
    },
    // Unwind the productData array
    { $unwind: '$productData' },
    // Calculate cost for each cart detail
    {
      $addFields: {
        itemCost: { $multiply: ['$cartDetailsData.quantity', '$productData.costPrice'] },
      },
    },
    // Group back to order level with cost calculation,
    {
      $group: {
        _id: '$_id',
        orderId: { $first: '$_id' },
        totalAmount: { $first: '$totalAmount' },
        createdAt: { $first: '$createdAt' },
        totalCost: { $sum: '$itemCost' },
      },
    },
    // Group by time period
    {
      $group: {
        _id: timeGrouping,
        revenue: { $sum: '$totalAmount' },
        // Calculate profit (revenue - cost)
        profit: {
          $sum: {
            $subtract: ['$totalAmount', '$totalCost'],
          },
        },
        createdAt: { $first: '$createdAt' },
      },
    },
  ];

  // Add any additional stages specific to the filter type
  if (additionalStages.length > 0) {
    pipeline.push(...additionalStages);
  }

  // Add sorting and projection
  pipeline.push({ $sort: sortStage }, { $project: projectStage });

  const result = await Order.aggregate(pipeline);

  return result;
};

const getTopSellingProducts = async (query) => {
  const { startDate, endDate, filterBy = 'day' } = query;
  const now = new Date();

  const orderMatchStage = {
    status: 'success',
  };

  if (startDate && endDate) {
    // If explicit date range is provided, use it
    orderMatchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    // Otherwise, apply automatic date ranges based on filterBy
    if (filterBy === 'day') {
      // Today's data
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      orderMatchStage.createdAt = { $gte: today };
    } else if (filterBy === 'week') {
      // One week from today
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      orderMatchStage.createdAt = { $gte: oneWeekAgo };
    } else if (filterBy === 'month') {
      // One month from today
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      orderMatchStage.createdAt = { $gte: oneMonthAgo };
    } else if (filterBy === 'year') {
      // One year from today
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      orderMatchStage.createdAt = { $gte: oneYearAgo };
    }
  }

  // 1. Find successful orders within the date range
  const successfulOrders = await Order.find(orderMatchStage).select('cartDetails').lean();

  // 2. Extract all cartDetail IDs from these orders
  const cartDetailIds = successfulOrders.flatMap((order) => order.cartDetails);

  if (cartDetailIds.length === 0) {
    return {
      period: getFilterPeriodInfo(filterBy, startDate, endDate),
      products: [],
    }; // No products sold in this period
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

  return {
    period: getFilterPeriodInfo(filterBy, startDate, endDate),
    products: topProducts,
  };
};

const getBrandMarketShare = async (query) => {
  const { startDate, endDate, filterBy = 'day' } = query;
  const now = new Date();

  // --- Find relevant CartDetail IDs (similar logic as getTopSellingProducts) ---
  const orderMatchStage = { status: 'success' };

  if (startDate && endDate) {
    // If explicit date range is provided, use it
    orderMatchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    // Otherwise, apply automatic date ranges based on filterBy
    if (filterBy === 'day') {
      // Today's data
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      orderMatchStage.createdAt = { $gte: today };
    } else if (filterBy === 'week') {
      // One week from today
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      orderMatchStage.createdAt = { $gte: oneWeekAgo };
    } else if (filterBy === 'month') {
      // One month from today
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      orderMatchStage.createdAt = { $gte: oneMonthAgo };
    } else if (filterBy === 'year') {
      // One year from today
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      orderMatchStage.createdAt = { $gte: oneYearAgo };
    }
  }

  const successfulOrders = await Order.find(orderMatchStage).select('cartDetails').lean();
  const cartDetailIds = successfulOrders.flatMap((order) => order.cartDetails);

  if (cartDetailIds.length === 0) {
    return {
      period: getFilterPeriodInfo(filterBy, startDate, endDate),
      brands: [],
    };
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

  return {
    period: getFilterPeriodInfo(filterBy, startDate, endDate),
    brands: marketShareData,
  };
};

const getProductDistribution = async (query) => {
  const { startDate, endDate, filterBy = 'day' } = query;
  const now = new Date();

  // --- Find relevant CartDetail IDs (similar logic as other functions) ---
  const orderMatchStage = { status: 'success' };

  if (startDate && endDate) {
    // If explicit date range is provided, use it
    orderMatchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    // Otherwise, apply automatic date ranges based on filterBy
    if (filterBy === 'day') {
      // Today's data
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      orderMatchStage.createdAt = { $gte: today };
    } else if (filterBy === 'week') {
      // One week from today
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      orderMatchStage.createdAt = { $gte: oneWeekAgo };
    } else if (filterBy === 'month') {
      // One month from today
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      orderMatchStage.createdAt = { $gte: oneMonthAgo };
    } else if (filterBy === 'year') {
      // One year from today
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      orderMatchStage.createdAt = { $gte: oneYearAgo };
    }
  }

  const successfulOrders = await Order.find(orderMatchStage).select('cartDetails').lean();
  const cartDetailIds = successfulOrders.flatMap((order) => order.cartDetails);

  if (cartDetailIds.length === 0) {
    return {
      period: getFilterPeriodInfo(filterBy, startDate, endDate),
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
    period: getFilterPeriodInfo(filterBy, startDate, endDate),
    totalSold,
    topProducts: topProductsData,
    othersPercentage,
  };
};

/**
 * Get order statistics by region (province)
 * @param {Object} query - Query parameters
 * @returns {Object} Statistics data
 */
const getOrdersByRegion = async (query) => {
  const { startDate, endDate, filterBy = 'day' } = query;
  const now = new Date();

  // Set up date filters based on filterBy parameter
  const matchStage = {
    status: 'success', // Only count successful orders
  };

  if (startDate && endDate) {
    // If explicit date range is provided, use it
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    // Otherwise, apply automatic date ranges based on filterBy
    if (filterBy === 'day') {
      // Today's data
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      matchStage.createdAt = { $gte: today };
    } else if (filterBy === 'week') {
      // One week from today
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      matchStage.createdAt = { $gte: oneWeekAgo };
    } else if (filterBy === 'month') {
      // One month from today
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      matchStage.createdAt = { $gte: oneMonthAgo };
    } else if (filterBy === 'year') {
      // One year from today
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      matchStage.createdAt = { $gte: oneYearAgo };
    }
  }

  // Count total orders in the period
  const totalOrders = await Order.countDocuments(matchStage);

  if (totalOrders === 0) {
    return {
      period: getFilterPeriodInfo(filterBy, startDate, endDate),
      totalOrders: 0,
      topCities: [],
      othersPercentage: 0,
    };
  }

  // Aggregate orders by province
  const ordersByProvince = await Order.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: '$address.province.provinceName',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        provinceName: '$_id',
        count: 1,
        percentage: {
          $multiply: [{ $divide: ['$count', totalOrders] }, 100],
        },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  // Get top 5 provinces
  const topCities = ordersByProvince.slice(0, 5);

  // Calculate the percentage of orders from other provinces
  const topCitiesTotal = topCities.reduce((sum, city) => sum + city.count, 0);
  const othersPercentage = ((totalOrders - topCitiesTotal) / totalOrders) * 100;

  return {
    period: getFilterPeriodInfo(filterBy, startDate, endDate),
    totalOrders,
    topCities,
    othersPercentage,
  };
};

/**
 * Get review statistics
 * @param {Object} query - Query parameters
 * @returns {Object} Review statistics data
 */
const getReviewStatistics = async (query) => {
  const { startDate, endDate, filterBy = 'day', productId } = query;
  const now = new Date();

  // Set up date filters based on filterBy parameter
  const matchStage = {};

  if (startDate && endDate) {
    // If explicit date range is provided, use it
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    // Otherwise, apply automatic date ranges based on filterBy
    if (filterBy === 'day') {
      // Today's data
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      matchStage.createdAt = { $gte: today };
    } else if (filterBy === 'week') {
      // One week from today
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      matchStage.createdAt = { $gte: oneWeekAgo };
    } else if (filterBy === 'month') {
      // One month from today
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      matchStage.createdAt = { $gte: oneMonthAgo };
    } else if (filterBy === 'year') {
      // One year from today
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      matchStage.createdAt = { $gte: oneYearAgo };
    }
  }

  // If productId is provided, filter by it
  if (productId) {
    matchStage.productId = mongoose.Types.ObjectId(productId);
  }

  // Count total reviews in the period
  const totalReviews = await Comment.countDocuments(matchStage);

  if (totalReviews === 0) {
    return {
      period: getFilterPeriodInfo(filterBy, startDate, endDate),
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: [],
    };
  }

  // Get average rating
  const ratingStats = await Comment.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Get rating distribution (count of each rating 1-5)
  const ratingDistribution = await Comment.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        rating: '$_id',
        count: 1,
        percentage: {
          $multiply: [{ $divide: ['$count', totalReviews] }, 100],
        },
      },
    },
    {
      $sort: { rating: 1 },
    },
  ]);

  return {
    period: getFilterPeriodInfo(filterBy, startDate, endDate),
    totalReviews,
    averageRating: ratingStats.length > 0 ? ratingStats[0].averageRating : 0,
    ratingDistribution,
  };
};

module.exports = {
  getRevenue,
  getTopSellingProducts,
  getBrandMarketShare,
  getProductDistribution,
  getOrdersByRegion,
  getReviewStatistics,
};
