const Joi = require('joi');

const getRevenue = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    filterBy: Joi.string().valid('day', 'week', 'month', 'year').default('month'),
  }),
};

const getTopSellingProducts = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    filterBy: Joi.string().valid('day', 'week', 'month', 'year').default('day'),
  }),
};

const getBrandMarketShare = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    filterBy: Joi.string().valid('day', 'week', 'month', 'year').default('day'),
  }),
};

const getProductDistribution = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    filterBy: Joi.string().valid('day', 'week', 'month', 'year').default('day'),
  }),
};

const getOrdersByRegion = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    filterBy: Joi.string().valid('day', 'week', 'month', 'year').default('day'),
  }),
};

const getReviewStatistics = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    filterBy: Joi.string().valid('day', 'week', 'month', 'year').default('day'),
    productId: Joi.string(),
  }),
};

module.exports = {
  getRevenue,
  getTopSellingProducts,
  getBrandMarketShare,
  getProductDistribution,
  getOrdersByRegion,
  getReviewStatistics,
};
