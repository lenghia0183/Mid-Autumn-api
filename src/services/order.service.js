const { Order, Cart } = require('../models');
const { orderMessage } = require('../messages');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const getOrdersByUserId = async (userId, requestQuery) => {
  const { limit = 10, page = 1, sortBy = 'createdAt:desc', status } = requestQuery;

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
        populate: [
          {
            path: 'manufacturerId',
          },
          {
            path: 'categoryId',
          },
        ],
      },
    })
    .sort(sortObject)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalOrders = await Order.countDocuments({ userId });

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
  const { limit = 10, page = 1, sortBy = 'createdAt:desc', status } = requestQuery;

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
        populate: [
          {
            path: 'manufacturerId',
          },
          {
            path: 'categoryId',
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

  const cart = await Cart.findById(cartId);

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

  if (paymentGateway === 'MoMo') {
    const paymentResponse = await paymentService.paymentWithMoMo(order, cart);
    console.log('paymentResponse: ', paymentResponse);
    order.payUrl = paymentResponse.payUrl;
    await order.save();
    return paymentResponse;
  } else if (paymentGateway === 'ZaloPay') {
    const paymentResponse = await paymentService.paymentWithZaloPay(order, cart);
    order.payUrl = paymentResponse.payUrl;
    await order.save();
    return paymentResponse;
  }
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

  if (order.userId.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, orderMessage().FORBIDDEN);
  }

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, orderMessage().NOT_FOUND);
  }
  return order;
};

const updateOrderById = async (orderId, updateBody, user) => {
  const order = await getOrderById(orderId);

  if (order.userId.toString() !== user?.id) {
    throw new ApiError(httpStatus.FORBIDDEN, orderMessage().FORBIDDEN);
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
    order.status = status;
    await order.save();
  }

  return order;
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
