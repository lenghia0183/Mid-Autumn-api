const Joi = require('joi');

const getRevenue = {
  query: Joi.object().keys({}),
};

module.exports = {
  getRevenue,
};
