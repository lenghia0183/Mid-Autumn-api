const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { visitService } = require('../services');
const response = require('../utils/response');
const { visitMessage } = require('../messages');

/**
 * Record a new visit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const recordVisit = catchAsync(async (req, res) => {
  const visit = await visitService.recordVisit(req);
  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, visitMessage().CREATE_SUCCESS, visit));
});

/**
 * Get visit statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVisitStatistics = catchAsync(async (req, res) => {
  const statistics = await visitService.getVisitStatistics(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, visitMessage().FIND_LIST_SUCCESS, statistics));
});

module.exports = {
  recordVisit,
  getVisitStatistics,
};
