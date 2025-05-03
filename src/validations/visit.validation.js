const Joi = require('joi');

const recordVisit = {
  // No validation needed for recording a visit
};

const getVisitStatistics = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    filterBy: Joi.string().valid('day', 'week', 'month', 'year'),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

module.exports = {
  recordVisit,
  getVisitStatistics,
};
