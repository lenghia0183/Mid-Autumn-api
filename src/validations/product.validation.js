const Joi = require('joi');
const { objectId } = require('./custom.validation');

const priceSchema = Joi.object({
  weight: Joi.string().valid('100g', '500g', '1kg'),
  price: Joi.number().required(),
});

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    prices: Joi.array().items(priceSchema).required(),
    description: Joi.string().allow(null, ''),
    images: Joi.array().items(Joi.string()).allow(null, ''),
    categoryId: Joi.string().custom(objectId).required(),
    manufacturerId: Joi.string().custom(objectId).required(),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    keyword: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    minPrice: Joi.number().integer(),
    maxPrice: Joi.number().integer(),
    categoryId: Joi.string().custom(objectId),
    manufacturerId: Joi.string().custom(objectId),
    minRating: Joi.number().integer().min(0).max(5),
    lang: Joi.string(),
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
    name: Joi.string().required(),
    prices: Joi.array().items(priceSchema),
    description: Joi.string().allow(null, ''),
    images: Joi.array().items(Joi.string()).allow(null, ''),
    categoryId: Joi.string().custom(objectId),
    manufacturerId: Joi.string().custom(objectId),
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
