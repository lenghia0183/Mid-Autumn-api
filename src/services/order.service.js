const { Order, Cart } = require('../models');
const { orderMessage } = require('../messages');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { updateCartDetailById } = require('./cart-detail.service');
const { productService } = require('.');

const getOrdersByUserId = async (userId, requestQuery) => {
  const { limit = 6, page = 1, sortBy = 'createdAt:desc', status } = requestQuery;

  const sort = sortBy.split(',').map((sortItem) => {
    const [field, option = 'desc'] = sortItem.split(':');
    return { [field]: option === 'desc' ? -1 : 1 };
  });

  const sortObject = Object.assign(...sort);

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {
    userId,
  };
  if (status) {
    filter.status = status;
  }

  let orders = await Order.find(filter)
    .populate({
      path: 'cartDetails',
      populate: {
        path: 'productId',
        select: 'name code price costPrice quantity inStock images description ratings',
        populate: [
          {
            path: 'manufacturerId',
            select: 'name',
          },
          {
            path: 'categoryId',
            select: 'name',
          },
        ],
      },
    })
    .sort(sortObject)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalOrders = await Order.countDocuments(filter);

  const totalPages = Math.ceil(totalOrders / limitNumber);

  const detailResult = {
    limit: limitNumber,
    totalResult: totalOrders,
    totalPage: totalPages,
    currentPage: pageNumber,
    currentResult: orders.length,
  };
  const result = { orders, ...detailResult };

  return result;
};

const getOrders = async (requestQuery) => {
  const { limit = 8, page = 1, sortBy = 'createdAt:desc', status } = requestQuery;

  const sort = sortBy.split(',').map((sortItem) => {
    const [field, option = 'desc'] = sortItem.split(':');
    return { [field]: option === 'desc' ? -1 : 1 };
  });

  const sortObject = Object.assign(...sort);

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};
  if (status) filter.status = status;

  let orders = await Order.find(filter)
    .populate({
      path: 'cartDetails',
      populate: {
        path: 'productId',
        select: 'name code price costPrice quantity inStock images description ratings',
        populate: [
          {
            path: 'manufacturerId',
            select: 'name',
          },
          {
            path: 'categoryId',
            select: 'name',
          },
        ],
      },
    })
    .sort(sortObject)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  // orders = await Promise.all(
  //   orders.map(async (order) => {
  //     const cart = await cartService.getCartById(order.cartId);
  //     order.products = cart.cartDetails;
  //     delete order.cartId;
  //     return order;
  //   }),
  // );

  const totalOrders = await Order.countDocuments();

  const totalPages = Math.ceil(totalOrders / limitNumber);

  const detailResult = {
    limit: limitNumber,
    totalResult: totalOrders,
    totalPage: totalPages,
    currentPage: pageNumber,
    currentResult: orders.length,
  };
  const result = { orders, ...detailResult };

  return result;
};

const createOrder = async (orderBody, userId) => {
  const paymentService = require('./payment.service');

  const {
    cartId,
    addressId,
    note,
    paymentMethod,
    paymentGateway,
    buyerName,
    buyerEmail,
    buyerPhone,
    recipientName,
    recipientPhone,
    address,
    shippingFee = 0,
  } = orderBody;

  const cart = await Cart.findById(cartId).populate({
    path: 'cartDetails',
    populate: {
      path: 'productId',
    },
  });

  const totalOrderMoney = +cart?.totalMoney + +shippingFee;

  const order = await Order.create({
    userId,
    cartDetails: cart.cartDetails,
    addressId,
    note,
    status: 'pending',
    shippingFee,
    address,
    paymentMethod,
    paymentGateway: paymentMethod === 'Bank' ? paymentGateway : undefined,
    isPaid: paymentMethod === 'Bank' ? false : undefined,
    totalAmount: totalOrderMoney,
    buyerName,
    buyerEmail,
    buyerPhone,
    recipientName,
    recipientPhone,
  });

  // Reduce product quantity for each ordered item and record inventory export
  const inventoryService = require('./inventory.service');
  await Promise.all(
    cart.cartDetails.map(async (cartDetail) => {
      const product = cartDetail.productId;

      // Ghi lại lịch sử xuất kho
      await inventoryService.exportFromInventory({
        productId: product._id,
        quantity: cartDetail.quantity,
        reason: 'Xuất kho cho đơn hàng',
        userId: userId,
        orderId: order._id,
      });
    }),
  );

  if (paymentGateway === 'MoMo') {
    const paymentResponse = await paymentService.paymentWithMoMo(order, cart);
    console.log('paymentResponse: ', paymentResponse);
    order.payUrl = paymentResponse.payUrl;

    // Store the requestId which will be used to match with the transId later
    order.momoRequestId = paymentResponse.requestId;

    await order.save();
    return paymentResponse;
  } else if (paymentGateway === 'ZaloPay') {
    const paymentResponse = await paymentService.paymentWithZaloPay(order, cart);
    order.payUrl = paymentResponse.payUrl;
    await order.save();
    return paymentResponse;
  } else {
    cart.status = 'inactive';
    await cart.save();
  }

  return order;
};

const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, orderMessage().NOT_FOUND);
  }
  return order;
};

const getOderByIdV2 = async (userId, orderId) => {
  const order = await Order.findById(orderId).populate({
    path: 'cartDetails',
    populate: {
      path: 'productId',
      select: 'name code price costPrice quantity inStock images description ratings',
      populate: [
        {
          path: 'manufacturerId',
          select: 'name',
        },
        {
          path: 'categoryId',
          select: 'name',
        },
      ],
    },
  });

  // if (order.userId.toString() !== userId) {
  //   throw new ApiError(httpStatus.FORBIDDEN, orderMessage().FORBIDDEN);
  // }

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, orderMessage().NOT_FOUND);
  }
  return order;
};

const updateOrderById = async (orderId, updateBody, user, isPaymentCallBack = false) => {
  const order = await getOrderById(orderId);

  if (!isPaymentCallBack) {
    if (order.userId.toString() !== user?.id) {
      throw new ApiError(httpStatus.FORBIDDEN, orderMessage().FORBIDDEN);
    }
  }

  Object.assign(order, updateBody);
  await order.save();
  return order;
};

const updateOrderStatus = async (orderId, status, user) => {
  const order = await getOrderById(orderId);

  const role = user.role;
  if (role === 'user') {
    if (order.userId.toString() !== user?.id) {
      throw new ApiError(httpStatus.FORBIDDEN, orderMessage().FORBIDDEN);
    }

    if (status === 'canceled') {
      if (order.status === 'pending') {
        await restoreProductQuantities(order);

        order.status = status;
        await order.save();
      } else {
        throw new ApiError(httpStatus.FORBIDDEN, orderMessage().CANNOT_CANCEL_ORDER);
      }
    } else {
      throw new ApiError(httpStatus.FORBIDDEN, orderMessage().FORBIDDEN);
    }
  }

  if (role === 'admin') {
    const previousStatus = order.status;
    order.status = status;

    if (previousStatus === 'pending' && status === 'canceled') {
      await restoreProductQuantities(order);
    }

    await order.save();

    if (order.status === 'success') {
      const cartDetails = order.cartDetails;
      await Promise.all(
        cartDetails.map(async (cartItem) => {
          await updateCartDetailById(cartItem.toString(), { commentStatus: 'allowed' });
        }),
      );
    }
  }

  return order;
};

const restoreProductQuantities = async (order) => {
  const populatedOrder = await Order.findById(order._id).populate({
    path: 'cartDetails',
    populate: {
      path: 'productId',
    },
  });

  if (!populatedOrder) return;

  const inventoryService = require('./inventory.service');
  await Promise.all(
    populatedOrder.cartDetails.map(async (cartDetail) => {
      const product = cartDetail.productId;

      // Ghi lại lịch sử nhập kho khi hoàn trả
      await inventoryService.addToInventory({
        productId: product._id,
        quantity: cartDetail.quantity,
        reason: 'Hoàn trả do hủy đơn hàng',
        note: `Đơn hàng ${order._id} bị hủy`,
        userId: order.userId,
      });
    }),
  );
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrderById,
  updateOrderStatus,
  getOrdersByUserId,
  getOrders,
  getOderByIdV2,
};
