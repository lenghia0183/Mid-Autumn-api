const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    code: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().allow(null, ''),
    images: Joi.array().items(Joi.string()).allow(null, ''),
    categoryId: Joi.string().custom(objectId).required(),
    manufacturerId: Joi.string().custom(objectId).required(),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    keyword: Joi.string().allow(null, ''),
    sortBy: Joi.string().allow(null, ''),
    limit: Joi.number().integer().allow(null, ''),
    page: Joi.number().integer().allow(null, ''),
    minPrice: Joi.number().integer().allow(null, ''),
    maxPrice: Joi.number().integer().allow(null, ''),
    categoryId: Joi.string().custom(objectId).allow(null, ''),
    manufacturerId: Joi.string().custom(objectId).allow(null, ''),
    minRating: Joi.number().integer().min(0).max(5).allow(null, ''),
    lang: Joi.string().allow(null, ''),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    code: Joi.string(),
    price: Joi.number(),
    description: Joi.string().allow(null, ''),
    images: Joi.array().items(Joi.string()).allow(null, ''),
    categoryId: Joi.string().custom(objectId),
    manufacturerId: Joi.string().custom(objectId),
    inStock: Joi.boolean().allow(null, ''),
  }),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
