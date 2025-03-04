const { Cart, CartDetail } = require('../models');
const { productService, favoriteService } = require('.');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { cartMessage } = require('../messages');

const getCartByUserId = async (queryRequest, userId) => {
  const { limit = 10, page = 1 } = queryRequest;
  const skip = +page <= 1 ? 0 : (+page - 1) * +limit;

  const cart = await Cart.findOne({ userId, status: 'active' });

  if (!cart) {
    return;
  }
  const totalCartDetails = await CartDetail.countDocuments({ _id: { $in: cart.cartDetails } });

  let cartDetails = await CartDetail.find({ _id: { $in: cart.cartDetails } })
    .populate({
      path: 'productId',
      populate: [{ path: 'manufacturerId' }, { path: 'categoryId' }],
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  let cartTotalMoney = cart?.totalMoney;

  const detailResults = {
    limit: +limit,
    totalResult: totalCartDetails,
    totalPage: Math.ceil(totalCartDetails / +limit),
    currentPage: +page,
    currentResult: cartDetails.length,
    id: cart.id,
  };

  const results = { cartDetails, cartTotalMoney, ...detailResults };
  return results;
};

const getCartById = async (cartId) => {
  const cart = await Cart.findById(cartId).populate({
    path: 'cartDetails',
    populate: {
      path: 'productId',
      populate: [
        {
          path: 'manufacturerId',
        },
        {
          path: 'categoryId',
        },
      ],
    },
  });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, cartMessage().NOT_FOUND);
  }
  return cart;
};

const addProductToCart = async (cartBody, userId) => {
  const { productId, quantity = 1 } = cartBody;

  const product = await productService.getProductById(productId);

  const cart = await Cart.findOne({ userId, status: 'active' }).populate([
    {
      path: 'cartDetails',
      populate: {
        path: 'productId',
      },
    },
  ]);

  if (!cart) {
    const newCartDetail = await CartDetail.create({
      productId,
      quantity,
      totalMoney: quantity * product.price,
    });
    await Cart.create({
      userId,
      status: 'active',
      cartDetails: [newCartDetail._id],
      totalMoney: newCartDetail.totalMoney,
    });
    return;
  }

  const cartDetail = cart?.cartDetails.find((cartDetail) => {
    return cartDetail.productId.id.toString() === productId;
  });

  if (cartDetail?.quantity + quantity > 100 || quantity > 100) {
    throw new ApiError(httpStatus.BAD_REQUEST, cartMessage().MAX_QUANTITY);
  }

  if (cartDetail) {
    cartDetail.quantity += quantity;
    cartDetail.totalMoney += quantity * product.price;
    cart.totalMoney += quantity * product.price;
    await cartDetail.save();
  } else {
    const newCartDetail = await CartDetail.create({
      productId,
      quantity,
      totalMoney: quantity * product.price,
    });
    cart.cartDetails.push(newCartDetail._id);
    cart.totalMoney += newCartDetail?.totalMoney;
  }
  await cart.save();
};

const clearMyCart = async (userId) => {
  const cart = await Cart.findOneAndDelete({ userId, status: 'active' });
  if (cart) {
    await CartDetail.deleteMany({ _id: { $in: cart.cartDetails } });
    cart.totalMoney = 0;
    await cart.save();
  }
};

const deleteCartDetail = async (cartDetailId, cartId) => {
  const cartDetail = await CartDetail.findOneAndDelete({ _id: cartDetailId });
  if (!cartDetail) {
    throw new ApiError(httpStatus.NOT_FOUND, cartMessage().NOT_FOUND);
  }
  await Cart.recalculateTotalMoney(cartId);
};

const updateCartDetail = async (cartDetailId, updateBody) => {
  const { quantity, cartId } = updateBody;
  const cartDetail = await CartDetail.findOne({ _id: cartDetailId }).populate({
    path: 'productId',
  });
  if (!cartDetail) {
    throw new ApiError(httpStatus.NOT_FOUND, cartMessage().NOT_FOUND);
  }

  const totalMoney = (quantity || cartDetail.quantity) * cartDetail.productId.price;

  cartDetail.set({
    quantity: quantity || cartDetail.quantity,
    totalMoney: totalMoney,
  });
  cartDetail.save();
  await Cart.recalculateTotalMoney(cartId);

  return cartDetail;
};

const updateCartById = async (cartId, updateBody) => {
  const cart = await getCartById(cartId);
  Object.assign(cart, updateBody);
  await cart.save();
  return cart;
};

module.exports = {
  addProductToCart,
  getCartByUserId,
  deleteCartDetail,
  clearMyCart,
  updateCartDetail,
  getCartById,
  updateCartById,
};
