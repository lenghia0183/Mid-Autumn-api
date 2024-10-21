const httpStatus = require('http-status');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { addressService } = require('../services');
const { addressMessage } = require('../messages');
const { REQUEST_USER_KEY } = require('../constants/index');

const createAddress = catchAsync(async (req, res) => {
  req.body.userId = req[REQUEST_USER_KEY]._id;
  const address = await addressService.createAddress(req.body);
  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, addressMessage().CREATE_SUCCESS, address));
});

const deleteAddress = catchAsync(async (req, res) => {
  const address = await addressService.deleteAddressById(req.params.addressId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, addressMessage().DELETE_SUCCESS, address));
});

const updateAddress = catchAsync(async (req, res) => {
  req.body.userId = req[REQUEST_USER_KEY]._id;
  const address = await addressService.updateAddress(req.params.addressId, req.body);
  res.status(httpStatus.OK).json(response(httpStatus.OK, addressMessage().UPDATE_SUCCESS, address));
});

const getAddresses = catchAsync(async (req, res) => {
  const addresses = await addressService.getAddressesByKeyword(req[REQUEST_USER_KEY]._id);
  res.status(httpStatus.OK).json(response(httpStatus.OK, addressMessage().FIND_LIST_SUCCESS, addresses));
});

module.exports = {
  createAddress,
  deleteAddress,
  updateAddress,
  getAddresses,
};
