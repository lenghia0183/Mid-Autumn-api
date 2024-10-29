const Joi = require('joi');
const { password, email, fullname } = require('./custom.validation');

const getMe = {};

const login = {
  body: Joi.object().keys({
    email: Joi.string().custom(email),
    password: Joi.string().custom(password),
  }),
};

const socialLogin = {
  body: Joi.object().keys({
    idToken: Joi.string().required(),
  }),
};

const register = {
  body: Joi.object().keys({
    email: Joi.string().custom(email),
    password: Joi.string().custom(password),
    fullname: Joi.string().custom(fullname),
  }),
};

const refreshToken = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

module.exports = {
  login,
  register,
  refreshToken,
  socialLogin,
  getMe,
};
