const { CartDetail } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { cartDetailMessage } = require('../messages');

const createCartDetail = async (cartDetailBody) => {
  const cartDetail = await CartDetail.create(cartDetailBody);
  return cartDetail;
};

const getCartDetailById = async (cartDetailId) => {
  const cartDetail = await CartDetail.findById(cartDetailId);

  if (!cartDetail) {
    throw new ApiError(httpStatus.NOT_FOUND, cartDetailMessage().NOT_FOUND);
  }
  cartDetail.userId = undefined;
  return cartDetail;
};

const updateCartDetailById = async (cartDetailId, cartDetailBody) => {
  const cartDetail = await getCartDetailById(cartDetailId);

  Object.assign(cartDetail, cartDetailBody);
  await cartDetail.save();

  cartDetail.userId = undefined;
  return cartDetail;
};

module.exports = {
  createCartDetail,
  updateCartDetailById,
  getCartDetailById,
};
