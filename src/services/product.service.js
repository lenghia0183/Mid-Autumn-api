const { Product } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { productMessage } = require('../messages');
const { getFavoriteListByUserId } = require('./favorite.service');

const createProduct = async (productBody) => {
  const product = await Product.create(productBody);
  return product;
};

const getProductById = async (productId, userId) => {
  const product = await Product.findById(productId)
    .select('-createdAt -updatedAt')
    .populate([
      {
        path: 'manufacturerId',
        select: 'name',
      },
      {
        path: 'categoryId',
        select: 'name',
      },
    ])
    .lean();

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, productMessage().NOT_FOUND);
  }

  if (userId) {
    const favoriteList = await getFavoriteListByUserId(userId);

    for (let i = 0; i < favoriteList?.productId?.length; i++) {
      if (favoriteList?.productId[i]._id.toString() === productId) {
        product.isFavorite = true;
        break;
      }
    }
  }

  return product;
};

const deleteProductById = async (productId) => {
  const product = await getProductById(productId);
  await product.deleteOne();
  return product;
};

const updateProductById = async (productId, updateBody) => {
  const product = await Product.findById(productId);
  Object.assign(product, updateBody);
  await product.save();
  return product;
};

const getProductByKeyWord = async (userId, requestQuery) => {
  const {
    limit = 10,
    page = 1,
    keyword = '',
    sortBy = 'createdAt:desc',
    manufacturerId,
    categoryId,
    minPrice,
    maxPrice,
    minRating,
  } = requestQuery;

  const sort = sortBy.split(',').map((sortItem) => {
    const [field, option = 'desc'] = sortItem.split(':');
    return { [field]: option === 'desc' ? -1 : 1 };
  });

  const sortObject = Object.assign(...sort);

  console.log('sortObject: ', sortObject);

  const query = {
    $and: [
      {
        $or: [
          { name: { $regex: new RegExp(keyword, 'i') } },
          { slug: { $regex: new RegExp(keyword, 'i') } },
          { description: { $regex: new RegExp(keyword, 'i') } },
        ],
      },
    ],
  };

  if (categoryId) {
    query.$and.push({ categoryId });
  }

  if (Array.isArray(manufacturerId) && manufacturerId.length > 0) {
    query.$and.push({ manufacturerId: { $in: manufacturerId } });
  }

  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) {
      priceFilter.$gte = minPrice;
    }
    if (maxPrice) {
      priceFilter.$lte = maxPrice;
    }
    query.$and.push({ price: priceFilter });
  }

  if (minRating) {
    query.$and.push({ ratings: { $gte: minRating } });
  }

  const skip = +page <= 1 ? 0 : (+page - 1) * +limit;

  const products = await Product.find(query)
    .select('name description images price manufacturer category ratings inStock')
    .populate([
      {
        path: 'manufacturerId',
        select: 'name',
      },
      {
        path: 'categoryId',
        select: 'name',
      },
    ])
    .skip(skip)
    .limit(limit)
    .sort(sortObject)
    .lean();

  if (userId) {
    const favorites = await getFavoriteListByUserId(userId);
    products.forEach((product) => {
      product.isFavorite = favorites?.productId.some((item) => item._id.toString() === product._id.toString());
    });
  }

  products.forEach((product) => {
    if (product.images) {
      product['image'] = product.images[0] || '';
    }
    delete product.images;
  });

  const totalSearch = await Product.countDocuments(query);

  const detailResult = {
    limit: +limit,
    totalResult: totalSearch,
    totalPage: Math.ceil(totalSearch / +limit),
    currentPage: +page,
    currentResult: products.length,
  };

  const results = { products, ...detailResult };
  return results;
};

module.exports = {
  createProduct,
  getProductByKeyWord,
  getProductById,
  deleteProductById,
  updateProductById,
};
