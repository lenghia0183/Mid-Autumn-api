const Joi = require('joi');

const generateProductDescription = {
  body: Joi.object().keys({
    prompt: Joi.string().required().min(10).max(1000),
  }),
};

const translateProductInfo = {
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(200),
    description: Joi.string().required().min(10).max(2000),
  }),
};

module.exports = {
  generateProductDescription,
  translateProductInfo,
};
