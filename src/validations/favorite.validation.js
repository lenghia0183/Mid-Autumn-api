const Joi = require('joi');
const { objectId } = require('./custom.validation');

const toggleFavorite = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const getFavoriteListByUserId = {};
const clearFavoriteList = {};

module.exports = {
  toggleFavorite,
  getFavoriteListByUserId,
  clearFavoriteList,
};
