const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createManufacturer = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const updateManufacturer = {
  params: Joi.object().keys({
    manufacturerId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const deleteManufacturer = {
  params: Joi.object().keys({
    manufacturerId: Joi.string().custom(objectId),
  }),
};

const getManufacturers = {
  query: Joi.object().keys({
    keyword: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  getManufacturers,
};
