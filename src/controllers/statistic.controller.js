const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { statisticService } = require('../services');
const response = require('../utils/response');
const commentMessage = require('../messages/comment.message');

const getRevenue = catchAsync(async (req, res) => {
  const query = req.query;
  const revenues = await statisticService.getRevenue(query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, commentMessage().FIND_LIST_SUCCESS, revenues));
});

const getTopSellingProducts = catchAsync(async (req, res) => {
  const result = await statisticService.getTopSellingProducts(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, commentMessage().FIND_LIST_SUCCESS, result));
});

const getBrandMarketShare = catchAsync(async (req, res) => {
  const result = await statisticService.getBrandMarketShare(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, commentMessage().FIND_LIST_SUCCESS, result));
});

const getProductDistribution = catchAsync(async (req, res) => {
  const result = await statisticService.getProductDistribution(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, commentMessage().FIND_LIST_SUCCESS, result));
});

const getOrdersByRegion = catchAsync(async (req, res) => {
  const result = await statisticService.getOrdersByRegion(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, commentMessage().FIND_LIST_SUCCESS, result));
});

const getReviewStatistics = catchAsync(async (req, res) => {
  const result = await statisticService.getReviewStatistics(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, commentMessage().FIND_LIST_SUCCESS, result));
});

module.exports = {
  getRevenue,
  getTopSellingProducts,
  getBrandMarketShare,
  getProductDistribution,
  getOrdersByRegion,
  getReviewStatistics,
};
