const httpStatus = require('http-status');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { inventoryService } = require('../services');
const { inventoryMessage } = require('../messages');
const { REQUEST_USER_KEY } = require('../constants');

const addToInventory = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY]._id;
  const inventoryData = { ...req.body, userId };

  const result = await inventoryService.addToInventory(inventoryData);

  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, inventoryMessage().ADD_SUCCESS, result));
});

const getInventoryStock = catchAsync(async (req, res) => {
  const result = await inventoryService.getInventoryStock(req.query);

  res.status(httpStatus.OK).json(response(httpStatus.OK, inventoryMessage().GET_STOCK_SUCCESS, result));
});

const getInventoryHistory = catchAsync(async (req, res) => {
  const result = await inventoryService.getInventoryHistory(req.query);

  res.status(httpStatus.OK).json(response(httpStatus.OK, inventoryMessage().GET_HISTORY_SUCCESS, result));
});

const getInventoryById = catchAsync(async (req, res) => {
  const inventory = await inventoryService.getInventoryById(req.params.inventoryId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, inventoryMessage().GET_DETAIL_SUCCESS, inventory));
});

const updateInventory = catchAsync(async (req, res) => {
  const inventory = await inventoryService.updateInventoryById(req.params.inventoryId, req.body);
  res.status(httpStatus.OK).json(response(httpStatus.OK, inventoryMessage().UPDATE_SUCCESS, inventory));
});

module.exports = {
  addToInventory,
  getInventoryStock,
  getInventoryHistory,
  getInventoryById,
  updateInventory,
};
