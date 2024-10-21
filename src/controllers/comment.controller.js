const httpStatus = require('http-status');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { commentService } = require('../services');
const { commentMessage } = require('../messages');
const { REQUEST_USER_KEY } = require('../constants/index');

const createComment = catchAsync(async (req, res) => {
  userId = req[REQUEST_USER_KEY]._id;
  const comment = await commentService.createComment(userId, req.body);
  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, commentMessage().CREATE_SUCCESS, comment));
});

const getCommentsByProductId = catchAsync(async (req, res) => {
  const query = req.query;
  const comments = await commentService.getCommentsByProductId(req.params.productId, query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, commentMessage().FIND_LIST_SUCCESS, comments));
});

const deleteCommentById = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY]._id;
  const comment = await commentService.deleteCommentById(userId, req.params.commentId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, commentMessage().DELETE_SUCCESS, comment));
});

const updateCommentById = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY]._id;
  const comment = await commentService.updateCommentById(userId, req.params.commentId, req.body);
  res.status(httpStatus.OK).json(response(httpStatus.OK, commentMessage().UPDATE_SUCCESS, comment));
});

module.exports = {
  createComment,
  getCommentsByProductId,
  deleteCommentById,
  updateCommentById,
};
