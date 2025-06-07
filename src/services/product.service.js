const { Product } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { productMessage } = require('../messages');
const { getFavoriteListByUserId } = require('./favorite.service');
const manufacturerService = require('./manufacturer.service');
const categoryService = require('./category.service');
const generateProductCode = require('../utils/generateProductCode');

const createProduct = async (productBody) => {
  const product = await Product.create(productBody);

  const manufacturer = await manufacturerService.getManufacturerById(productBody.manufacturerId);
  const category = await categoryService.getCategoryById(productBody.categoryId);

  product.code = generateProductCode(manufacturer.name, category.name, product._id.toString());
  await product.save();

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
    ]);

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

  // await Product.deleteOne(product);
  product.deletedAt = new Date();
  await product.save();
  return product;
};

const updateProductById = async (productId, updateBody) => {
  const product = await getProductById(productId);

  if (updateBody?.images && updateBody?.images.length === 0) {
    updateBody.images = product?.images;
  }

  // Handle quantity update
  if (updateBody.quantity !== undefined) {
    // If quantity is greater than 0, set inStock to true automatically
    if (updateBody.quantity > 0 && !updateBody.inStock) {
      updateBody.inStock = true;
    }
    // If quantity is 0, set inStock to false automatically
    else if (updateBody.quantity === 0 && updateBody.inStock === undefined) {
      updateBody.inStock = false;
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(productId, { $set: updateBody }, { new: true });

  return updatedProduct;
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
    minQuantity,
    maxQuantity,
    minRating,
  } = requestQuery;

  const sort = sortBy.split(',').map((sortItem) => {
    const [field, option = 'desc'] = sortItem.split(':');
    return { [field]: option === 'desc' ? -1 : 1 };
  });

  const sortObject = Object.assign(...sort);

  const query = {
    $and: [
      {
        $or: [
          { name: { $regex: new RegExp(keyword, 'i') } },
          { nameEn: { $regex: new RegExp(keyword, 'i') } },
          { nameZh: { $regex: new RegExp(keyword, 'i') } },
          { nameJa: { $regex: new RegExp(keyword, 'i') } },
          { slug: { $regex: new RegExp(keyword, 'i') } },
          { description: { $regex: new RegExp(keyword, 'i') } },
          { descriptionEn: { $regex: new RegExp(keyword, 'i') } },
          { descriptionZh: { $regex: new RegExp(keyword, 'i') } },
          { descriptionJa: { $regex: new RegExp(keyword, 'i') } },
        ],
      },
      {
        deletedAt: null,
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

  if (minQuantity || maxQuantity) {
    const quantityFilter = {};
    if (minQuantity) {
      quantityFilter.$gte = minQuantity;
    }
    if (maxQuantity) {
      quantityFilter.$lte = maxQuantity;
    }
    query.$and.push({ quantity: quantityFilter });
  }

  if (minRating) {
    query.$and.push({ ratings: { $gte: minRating } });
  }

  const skip = +page <= 1 ? 0 : (+page - 1) * +limit;

  const products = await Product.find(query)
    .select(
      'name nameEn nameZh nameJa description descriptionEn descriptionZh descriptionJa images price costPrice quantity manufacturerId categoryId ratings inStock code',
    )
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

    // Thêm thông tin trạng thái tồn kho
    product.stockStatus = product.inStock ? 'Còn hàng' : 'Hết hàng';
    product.availableQuantity = product.quantity;
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
