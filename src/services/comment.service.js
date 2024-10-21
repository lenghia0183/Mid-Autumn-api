const { Comment, Product } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { commentMessage } = require('../messages');

const calculateAndUpdateProductRating = async (productId) => {
  const comments = await Comment.find({ productId });

  if (comments.length > 0) {
    const totalRating = comments.reduce((acc, comment) => acc + comment.rating, 0);
    const averageRating = totalRating / comments.length;

    await Product.findByIdAndUpdate(productId, { ratings: averageRating });
  } else {
    return;
  }
};

const getCommentById = async (commentId) => {
  const comment = await Comment.findById({ _id: commentId }).populate({ path: 'userId', select: 'fullname' });
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, commentMessage().NOT_FOUND);
  }
  return comment;
};

const createComment = async (userId, commentBody) => {
  const { cartDetailService } = require('../services');

  const comment = await Comment.create({ userId, ...commentBody });
  await cartDetailService.updateCartDetailById(commentBody.cartDetailId, { commentStatus: 'commented' });
  await calculateAndUpdateProductRating(comment.productId);
  return comment;
};

const getCommentsByProductId = async (productId, query) => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ productId })
    .populate({ path: 'userId', select: 'fullname' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalSearch = await Comment.countDocuments({ productId });

  const detailResult = {
    limit: +limit,
    totalResult: totalSearch || 0,
    totalPage: Math.ceil(totalSearch / +limit),
    currentPage: +page,
    currentResult: comments.length,
  };

  const results = { comments, ...detailResult };
  return results;
};

const deleteCommentById = async (userId, commentId) => {
  const comment = await getCommentById(commentId);

  if (comment.userId?._id.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, commentMessage().FORBIDDEN_UPDATE);
  }
  await comment.deleteOne();
  await calculateAndUpdateProductRating(comment.productId);

  return comment;
};

const updateCommentById = async (userId, commentId, updateBody) => {
  const comment = await getCommentById(commentId);

  if (comment.userId?._id.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, commentMessage().FORBIDDEN_UPDATE);
  }

  Object.assign(comment, updateBody);
  await comment.save();

  await calculateAndUpdateProductRating(comment.productId);
  return comment;
};

module.exports = {
  createComment,
  getCommentsByProductId,
  deleteCommentById,
  updateCommentById,
};
