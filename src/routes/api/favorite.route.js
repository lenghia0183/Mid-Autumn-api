const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { favoriteController } = require('../../controllers');
const { favoriteValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const favoriteRouter = express.Router();

favoriteRouter.put(
  '/:productId/toggle',
  authenticate,
  authorize('user'),
  validate(favoriteValidation.toggleFavorite),
  favoriteController.toggleFavorite,
);

favoriteRouter.get(
  '/me',
  authenticate,
  authorize('user'),
  validate(favoriteValidation.getFavoriteListByUserId),
  favoriteController.getFavoriteListByUserId,
);

favoriteRouter.delete(
  '/me',
  authenticate,
  authorize('user'),
  validate(favoriteValidation.clearFavoriteList),
  favoriteController.clearFavoriteList,
);

module.exports = favoriteRouter;
