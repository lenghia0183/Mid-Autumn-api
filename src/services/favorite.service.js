const { Favorite } = require('../models');
const httpStatus = require('http-status');

const { TOGGLE_VALUE } = require('../constants');

const toggleFavorite = async (userId, productId) => {
  let favorite = await Favorite.findOne({ userId });

  if (!favorite) {
    favorite = await Favorite.create({ userId, productIds: [productId] });
    return TOGGLE_VALUE.ON;
  } else {
    const productIndex = favorite.productId.indexOf(productId);
    if (productIndex === -1) {
      favorite.productId.push(productId);
      await favorite.save();
      return TOGGLE_VALUE.ON;
    } else {
      favorite.productId.splice(productIndex, 1);
      await favorite.save();
      return TOGGLE_VALUE.OFF;
    }
  }
};

const getFavoriteListByUserId = async (userId) => {
  const favorites = await Favorite.findOne({ userId }).populate({
    path: 'productId',
    populate: [
      {
        path: 'categoryId',
      },
      {
        path: 'manufacturerId',
      },
    ],
  });
  return favorites;
};

const clearFavoriteList = async (userId) => {
  const favorite = await getFavoriteListByUserId(userId);
  if (favorite) {
    favorite.productId = [];
    await favorite.save();
  }

  return;
};

module.exports = {
  toggleFavorite,
  getFavoriteListByUserId,
  clearFavoriteList,
};
