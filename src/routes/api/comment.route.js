const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { commentController } = require('../../controllers');
const { commentValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const commentRouter = express.Router();

commentRouter.post(
  '/',
  authenticate,
  authorize('user'),
  validate(commentValidation.createComment),
  commentController.createComment,
);

commentRouter.get(
  '/:productId',
  // authenticate,
  // // authorize('user'),
  validate(commentValidation.getCommentsByProductId),
  commentController.getCommentsByProductId,
);

commentRouter.delete(
  '/:commentId',
  authenticate,
  authorize('user'),
  validate(commentValidation.deleteCommentById),
  commentController.deleteCommentById,
);

commentRouter.put(
  '/:commentId',
  authenticate,
  authorize('user'),
  validate(commentValidation.updateCommentById),
  commentController.updateCommentById,
);

module.exports = commentRouter;
