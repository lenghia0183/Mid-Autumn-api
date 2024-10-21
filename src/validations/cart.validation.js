const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addProductToCart = {
  body: Joi.object().keys({
    quantity: Joi.number().integer().min(1).required(),
    productId: Joi.string().custom(objectId).required(),
    selectedWeight: Joi.string().valid('100g', '500g', '1kg').required(),
  }),
};

const getMyCart = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    lang: Joi.string(),
  }),
};

const updateCartDetail = {
  params: Joi.object().keys({
    cartDetailId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    cartId: Joi.string().required().custom(objectId),
    quantity: Joi.number().integer().min(1),
    selectedWeight: Joi.string().valid('100g', '500g', '1kg'),
  }),
};

const clearMyCart = {
  params: Joi.object().keys({}),
};

const deleteCartDetail = {
  params: Joi.object().keys({
    cartDetailId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  addProductToCart,
  getMyCart,
  deleteCartDetail,
  updateCartDetail,
  clearMyCart,
};
