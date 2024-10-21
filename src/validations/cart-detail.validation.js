const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCartDetail = {
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId),
    quantity: Joi.number().required(),
    selectedWeight: Joi.string().required(),
  }),
};

const getCartDetails = {
  query: Joi.object().keys({
    keyword: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    lang: Joi.string(),
    productId: Joi.string().custom(objectId),
    quantity: Joi.string().allow(null, ''),
  }),
};

const getCartDetail = {
  params: Joi.object().keys({
    cartDetailId: Joi.string().custom(objectId),
  }),
};

const updateCartDetail = {
  params: Joi.object().keys({
    cartDetailId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      productId: Joi.string().custom(objectId),
      quantity: Joi.number().required(),
    })
    .min(1),
};

const deleteCartDetail = {
  params: Joi.object().keys({
    cartDetailId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createCartDetail,
  getCartDetails,
  getCartDetail,
  updateCartDetail,
  deleteCartDetail,
};
