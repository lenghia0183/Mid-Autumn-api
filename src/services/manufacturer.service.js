const { Manufacturer } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { manufacturerMessage } = require('../messages');
const ApiFeature = require('../utils/ApiFeature');

const createManufacturer = async (ManufacturerBody) => {
  const manufacturer = await Manufacturer.create(ManufacturerBody);
  return manufacturer;
};

const getManufacturerById = async (manufacturerId) => {
  const manufacturer = await Manufacturer.findById(manufacturerId);
  if (!manufacturer) {
    throw new ApiError(httpStatus.NOT_FOUND, manufacturerMessage().NOT_FOUND);
  }
  return manufacturer;
};

const getManufacturersByKeyword = async (query) => {
  const apiFeature = new ApiFeature(Manufacturer);
  const { results, ...detailResult } = await apiFeature.getResults(query, ['name']);
  return { manufacturers: results, ...detailResult };
};

const deleteManufacturerById = async (manufacturerId) => {
  const manufacturer = await getManufacturerById(manufacturerId);
  await manufacturer.deleteOne();
  return manufacturer;
};

const updateManufacturer = async (manufacturerId, manufacturerBody) => {
  const manufacturer = await getManufacturerById(manufacturerId);
  Object.assign(manufacturer, manufacturerBody);
  await manufacturer.save();
  return manufacturer;
};

module.exports = {
  createManufacturer,
  deleteManufacturerById,
  getManufacturersByKeyword,
  updateManufacturer,
  getManufacturerById,
};
