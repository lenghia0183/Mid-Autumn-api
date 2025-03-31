const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { statisticService } = require('../services');
const response = require('../utils/response');
const commentMessage = require('../messages/comment.message');

const getRevenue = catchAsync(async (req, res) => {
  const query = req.query;
  const comments = await statisticService.getRevenue(query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, commentMessage().FIND_LIST_SUCCESS, comments));
});

module.exports = {
  getRevenue,
};
