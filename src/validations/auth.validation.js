const Joi = require('joi');
const { password, email, fullname } = require('./custom.validation');

const getMe = {};

const updateMe = {
  body: Joi.object()
    .keys({
      fullname: Joi.string(),
      email: Joi.string().custom(email),
      password: Joi.string().custom(password),
      isLocked: Joi.boolean().valid(true, false),
      isVerify: Joi.boolean().valid(true, false),
      phone: Joi.string().allow(null, ''),
      dateOfBirth: Joi.date().allow(null, ''),
      address: Joi.string().allow(null, ''),
      avatar: Joi.string().allow(null, ''),
      gender: Joi.string().allow('male', 'female', ''),
      address: Joi.object({
        province: Joi.object({
          provinceId: Joi.number(),
          provinceName: Joi.string(),
        }),
        district: Joi.object({
          districtId: Joi.number(),
          districtName: Joi.string(),
        }),
        ward: Joi.object({
          wardCode: Joi.string(),
          wardName: Joi.string(),
        }),
        street: Joi.string(),
      }),
    })
    .min(1),
};

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
  updateMe,
};
