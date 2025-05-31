const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addToInventory = {
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
    quantity: Joi.number().integer().min(1).required(),
    reason: Joi.string().required(),
    note: Joi.string().allow('', null),
  }),
};

const getInventoryStock = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string().allow(''),
    categoryId: Joi.string().custom(objectId),
    manufacturerId: Joi.string().custom(objectId),
    lowStock: Joi.string().valid('true', 'false'),
  }),
};

const getInventoryHistory = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    productId: Joi.string().custom(objectId),
    type: Joi.string().valid('import', 'export'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  }),
};

module.exports = {
  addToInventory,
  getInventoryStock,
  getInventoryHistory,
};
