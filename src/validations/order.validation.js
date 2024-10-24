const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
  body: Joi.object().keys({
    cartId: Joi.string().custom(objectId),

    buyerName: Joi.string().required(),
    buyerEmail: Joi.string().required(),
    buyerPhone: Joi.string().required(),
    recipientName: Joi.string().required(),
    recipientPhone: Joi.string().required(),

    address: Joi.object({
      province: Joi.object({
        provinceId: Joi.number().required(),
        provinceName: Joi.string().required(),
      }).required(),
      district: Joi.object({
        districtId: Joi.number().required(),
        districtName: Joi.string().required(),
      }).required(),
      ward: Joi.object({
        wardCode: Joi.string().required(),
        wardName: Joi.string().required(),
      }).required(),
      street: Joi.string().required(),
    }).required(),

    shippingFee: Joi.number().required(),
    paymentMethod: Joi.string().required(),
    paymentGateway: Joi.string().required(),
    note: Joi.string().allow(null, ''),
  }),
};

const getOrders = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    sort: Joi.string(),
    status: Joi.string().valid('pending', 'confirmed', 'reject', 'shipping', 'success', 'canceled'),
  }),
};

const getOrdersByUserId = {
  query: Joi.object().keys({
    keyword: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    sort: Joi.string(),
    status: Joi.string().valid('pending', 'confirmed', 'reject', 'shipping', 'success', 'canceled'),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const getOrderById = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const updateOrderStatus = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'confirmed', 'reject', 'shipping', 'success', 'canceled').required(),
  }),
};
const updateOrderById = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      buyerName: Joi.string().required(),
      buyerEmail: Joi.string().required(),
      buyerPhone: Joi.string().required(),
      recipientName: Joi.string().required(),
      recipientPhone: Joi.string().required(),

      address: Joi.object({
        province: Joi.object({
          provinceId: Joi.number(),
          provinceName: Joi.string(),
        }),
        district: Joi.object({
          districtId: Joi.number(),
          districtName: Joi.string(),
        }),
        ward: Joi.object({
          wardCode: Joi.string(),
          wardName: Joi.string(),
        }),
        street: Joi.string(),
      }),
      note: Joi.string().allow(null, ''),
    })
    .min(1),
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderById,
  getOrdersByUserId,
  updateOrderStatus,
  getOrderById,
};
