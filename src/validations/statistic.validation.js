const Joi = require('joi');

const getRevenue = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  }),
};

const getTopSellingProducts = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  }),
};

const getBrandMarketShare = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  }),
};

const getProductDistribution = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  }),
};

module.exports = {
  getRevenue,
  getTopSellingProducts,
  getBrandMarketShare,
  getProductDistribution,
};
