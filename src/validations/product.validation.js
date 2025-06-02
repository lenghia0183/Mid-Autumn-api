const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    nameEn: Joi.string().allow(null, ''),
    nameZh: Joi.string().allow(null, ''),
    nameJa: Joi.string().allow(null, ''),
    code: Joi.string().allow(null, ''),
    price: Joi.number().required(),
    costPrice: Joi.number().required(),
    quantity: Joi.number().default(0),
    description: Joi.string().allow(null, ''),
    descriptionEn: Joi.string().allow(null, ''),
    descriptionZh: Joi.string().allow(null, ''),
    descriptionJa: Joi.string().allow(null, ''),
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
    minQuantity: Joi.number().integer().allow(null, ''),
    maxQuantity: Joi.number().integer().allow(null, ''),
    categoryId: Joi.string().custom(objectId).allow(null, ''),
    manufacturerId: Joi.array().items(Joi.string().custom(objectId)),
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
    nameEn: Joi.string().allow(null, ''),
    nameZh: Joi.string().allow(null, ''),
    nameJa: Joi.string().allow(null, ''),
    code: Joi.string(),
    price: Joi.number(),
    costPrice: Joi.number(),
    quantity: Joi.number(),
    description: Joi.string().allow(null, ''),
    descriptionEn: Joi.string().allow(null, ''),
    descriptionZh: Joi.string().allow(null, ''),
    descriptionJa: Joi.string().allow(null, ''),
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
