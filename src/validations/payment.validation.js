const Joi = require('joi');
const { objectId } = require('./custom.validation');

const refundMoMoPayment = {
  body: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required(),
    amount: Joi.number().required(),
    description: Joi.string().required(),
  }),
};

module.exports = {
  refundMoMoPayment,
};