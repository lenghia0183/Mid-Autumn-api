const { Address } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { addressMessage } = require('../messages');
const ApiFeature = require('../utils/ApiFeature');

const createAddress = async (AddressBody) => {
  const address = await Address.create(AddressBody);
  address.userId = undefined;
  return address;
};

const getAddressById = async (addressId) => {
  const address = await Address.findById(addressId);
  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, addressMessage().NOT_FOUND);
  }
  address.userId = undefined;
  return address;
};

const getAddressesByKeyword = async (query) => {
  //   const apiFeature = new ApiFeature(Address);
  //   const { results, ...detailResult } = await apiFeature.getResults(query, ['name']);

  const addresses = await Address.find({ userId: query });

  return addresses;
};

const deleteAddressById = async (addressId) => {
  const address = await getAddressById(addressId);
  await address.deleteOne();
  address.userId = undefined;
  return address;
};

const updateAddress = async (addressId, addressBody) => {
  const address = await getAddressById(addressId);
  Object.assign(address, addressBody);
  await address.save();
  address.userId = undefined;
  return address;
};

module.exports = {
  createAddress,
  deleteAddressById,
  getAddressesByKeyword,
  updateAddress,
};
