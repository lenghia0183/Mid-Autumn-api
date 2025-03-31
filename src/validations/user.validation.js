const Joi = require('joi');
const { password, objectId, email, role } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    fullname: Joi.string().required(),
    email: Joi.string().custom(email),
    password: Joi.string().custom(password),
    role: Joi.string().custom(role),
    isLocked: Joi.boolean().valid(true, false),
    isVerify: Joi.boolean().valid(true, false),
    phone: Joi.string().allow(null, ''),
    dateOfBirth: Joi.date().allow(null, ''),
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
    avatar: Joi.string().allow(null, ''),
    gender: Joi.string().allow('male', 'female', ''),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    keyword: Joi.string().allow(null, ''),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    lang: Joi.string(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    fullname: Joi.string(),
    email: Joi.string().custom(email),
    password: Joi.string().custom(password),
    role: Joi.string().custom(role),
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
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const lockUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  lockUser,
};
