const httpStatus = require('http-status');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { favoriteService } = require('../services');
const { favoriteMessage } = require('../messages');
const { REQUEST_USER_KEY, TOGGLE_VALUE } = require('../constants');

const toggleFavorite = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY].id;
  const favorite = await favoriteService.toggleFavorite(userId, req.params.productId);
  if (favorite === TOGGLE_VALUE.ON) {
    res.status(httpStatus.OK).json(response(httpStatus.OK, favoriteMessage().ADD_TO_LIST_SUCCESS));
  } else {
    res.status(httpStatus.OK).json(response(httpStatus.OK, favoriteMessage().DELETE_SUCCESS));
  }
});

const getFavoriteListByUserId = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY].id;
  const favoriteList = await favoriteService.getFavoriteListByUserId(userId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, favoriteMessage().FIND_LIST_SUCCESS, favoriteList));
});

const clearFavoriteList = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY].id;
  await favoriteService.clearFavoriteList(userId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, favoriteMessage().CLEAR_SUCCESS));
});

module.exports = {
  toggleFavorite,
  getFavoriteListByUserId,
  clearFavoriteList,
};
