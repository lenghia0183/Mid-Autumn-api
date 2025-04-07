const httpStatus = require('http-status');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');
const { orderMessage } = require('../messages');
const { REQUEST_USER_KEY } = require('../constants');

const createOrder = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY].id;
  const order = await orderService.createOrder(req.body, userId);
  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, orderMessage().CREATE_SUCCESS, order));
});

const getOrdersByUserId = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY].id;
  const orders = await orderService.getOrdersByUserId(userId, req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, orderMessage().FIND_LIST_SUCCESS, orders));
});

const getOrderById = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY].id;
  const order = await orderService.getOderByIdV2(userId, req.params.orderId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, orderMessage().FIND_SUCCESS, order));
});

const getOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getOrders(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, orderMessage().FIND_LIST_SUCCESS, orders));
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const user = req[REQUEST_USER_KEY];
  const status = req.body.status;
  const order = await orderService.updateOrderStatus(req.params.orderId, status, user);
  res.status(httpStatus.OK).json(response(httpStatus.OK, orderMessage().UPDATE_SUCCESS, order));
});

const updateOrderById = catchAsync(async (req, res) => {
  const user = req[REQUEST_USER_KEY];
  const order = await orderService.updateOrderById(req.params.orderId, req.body, user);
  res.status(httpStatus.OK).json(response(httpStatus.OK, orderMessage().UPDATE_SUCCESS, order));
});

module.exports = {
  createOrder,
  getOrdersByUserId,
  updateOrderStatus,
  getOrders,
  updateOrderById,
  getOrderById,
};
