const Joi = require('joi');

const generateProductDescription = {
  body: Joi.object().keys({
    prompt: Joi.string().required().min(10).max(1000),
  }),
};

module.exports = {
  generateProductDescription,
};
