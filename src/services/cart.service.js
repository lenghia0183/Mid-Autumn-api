const { Cart, CartDetail } = require('../models');
const { productService } = require('.');
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
    .populate('productId')
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
  const { productId, quantity = 1, selectedWeight } = cartBody;

  const product = await productService.getProductById(productId);

  const selectedPrice = product.prices.find((priceOpt) => {
    return priceOpt.weight === selectedWeight;
  }).price;

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
      selectedWeight,
      totalMoney: quantity * selectedPrice,
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
    return cartDetail.productId.id.toString() === productId && cartDetail?.selectedWeight === selectedWeight;
  });

  if (cartDetail?.quantity + quantity > 100 || quantity > 100) {
    throw new ApiError(httpStatus.BAD_REQUEST, cartMessage().MAX_QUANTITY);
  }

  if (cartDetail) {
    cartDetail.quantity += quantity;
    cartDetail.totalMoney += quantity * selectedPrice;
    cart.totalMoney += quantity * selectedPrice;
    await cartDetail.save();
  } else {
    const newCartDetail = await CartDetail.create({
      productId,
      quantity,
      selectedWeight,
      totalMoney: quantity * selectedPrice,
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
  const { quantity, selectedWeight, cartId } = updateBody;
  const cartDetail = await CartDetail.findOne({ _id: cartDetailId }).populate({
    path: 'productId',
  });
  if (!cartDetail) {
    throw new ApiError(httpStatus.NOT_FOUND, cartMessage().NOT_FOUND);
  }

  const selectedPrice = cartDetail.productId.prices.find((priceOpt) => {
    return priceOpt.weight === (selectedWeight || cartDetail.selectedWeight);
  })?.price;
  const totalMoney = (quantity || cartDetail.quantity) * (selectedPrice || cartDetail.selectedPrice);

  const existingSameCartDetail = await CartDetail.findOne({
    productId: cartDetail.productId._id,
    selectedWeight: selectedWeight,
    _id: { $ne: cartDetailId },
  }).populate({
    path: 'productId',
  });

  if (existingSameCartDetail) {
    existingSameCartDetail.quantity += quantity || cartDetail.quantity;
    existingSameCartDetail.totalMoney =
      existingSameCartDetail.quantity * (selectedPrice || existingSameCartDetail.selectedPrice);

    await existingSameCartDetail.save();

    await CartDetail.deleteOne({ _id: cartDetailId });

    return existingSameCartDetail;
  }

  cartDetail.set({
    quantity: quantity || cartDetail.quantity,
    selectedWeight: selectedWeight || cartDetail.selectedWeight,
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
