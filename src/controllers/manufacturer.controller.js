const httpStatus = require('http-status');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { manufacturerService } = require('../services');
const { manufacturerMessage } = require('../messages');

const createManufacturer = catchAsync(async (req, res) => {
  const manufacturer = await manufacturerService.createManufacturer(req.body);
  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, manufacturerMessage().CREATE_SUCCESS, manufacturer));
});

const deleteManufacturer = catchAsync(async (req, res) => {
  const manufacturer = await manufacturerService.deleteManufacturerById(req.params.manufacturerId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, manufacturerMessage().DELETE_SUCCESS, manufacturer));
});

const updateManufacturer = catchAsync(async (req, res) => {
  const manufacturer = await manufacturerService.updateManufacturer(req.params.manufacturerId, req.body);
  res.status(httpStatus.OK).json(response(httpStatus.OK, manufacturerMessage().UPDATE_SUCCESS, manufacturer));
});

const getManufacturers = catchAsync(async (req, res) => {
  const categories = await manufacturerService.getManufacturersByKeyword(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, manufacturerMessage().FIND_LIST_SUCCESS, categories));
});

module.exports = {
  createManufacturer,
  deleteManufacturer,
  updateManufacturer,
  getManufacturers,
};
