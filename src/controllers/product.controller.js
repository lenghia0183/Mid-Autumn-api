const httpStatus = require('http-status');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');
const { productMessage } = require('../messages');
const { REQUEST_USER_KEY } = require('../constants');

const createProduct = catchAsync(async (req, res) => {
  if (req.files) {
    req.body['images'] = req.files.map((file) => file.path);
  }
  const product = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, productMessage().CREATE_SUCCESS, product));
});

const getProducts = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY]?._id;
  const products = await productService.getProductByKeyWord(userId, req.query);

  res.status(httpStatus.OK).json(response(httpStatus.OK, productMessage().FIND_LIST_SUCCESS, products));
});

const getProduct = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY]?._id;
  const product = await productService.getProductById(req.params.productId, userId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, productMessage().FIND_SUCCESS, product));
});

const deleteProduct = catchAsync(async (req, res) => {
  const product = await productService.deleteProductById(req.params.productId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, productMessage().DELETE_SUCCESS, product));
});

const updateProduct = catchAsync(async (req, res) => {
  if (req.files) {
    req.body['images'] = req.files.map((file) => file.path);
  }
  const product = await productService.updateProductById(req.params.productId, req.body);
  res.status(httpStatus.OK).json(response(httpStatus.OK, productMessage().UPDATE_SUCCESS, product));
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};
