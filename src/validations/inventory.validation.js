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

const getInventoryById = {
  params: Joi.object().keys({
    inventoryId: Joi.string().required().custom(objectId),
  }),
};

const updateInventory = {
  params: Joi.object().keys({
    inventoryId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      note: Joi.string().allow('', null),
      reason: Joi.string(),
      productId: Joi.string().custom(objectId),
      quantity: Joi.number().integer().min(1),
    })
    .min(1),
};

module.exports = {
  addToInventory,
  getInventoryStock,
  getInventoryHistory,
  getInventoryById,
  updateInventory,
};
