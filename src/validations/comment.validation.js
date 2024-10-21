const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createComment = {
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
    cartDetailId: Joi.string().custom(objectId).required(),
    content: Joi.string(),
    rating: Joi.number().required(),
  }),
};

const getCommentsByProductId = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateCommentById = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    content: Joi.string().allow(null, ''),
    rating: Joi.number().allow(null, ''),
  }),
};

const deleteCommentById = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createComment,
  getCommentsByProductId,
  updateCommentById,
  deleteCommentById,
};
