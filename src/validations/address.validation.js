const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAddress = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    street: Joi.string().required(),
    province: Joi.object()
      .keys({
        provinceName: Joi.string().required(),
        provinceId: Joi.number().required(),
      })
      .required(),
    district: Joi.object()
      .keys({
        districtName: Joi.string().required(),
        districtId: Joi.number().required(),
      })
      .required(),
    ward: Joi.object()
      .keys({
        wardName: Joi.string().required(),
        wardId: Joi.number().required(),
      })
      .required(),
  }),
};

const updateAddress = {
  params: Joi.object().keys({
    addressId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    phone: Joi.string(),
    street: Joi.string(),
    province: Joi.object().keys({
      provinceName: Joi.string().required(),
      provinceId: Joi.number().required(),
    }),
    district: Joi.object().keys({
      districtName: Joi.string().required(),
      districtId: Joi.number().required(),
    }),
    ward: Joi.object().keys({
      wardName: Joi.string().required(),
      wardId: Joi.number().required(),
    }),
  }),
};

const getAddresses = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const getAddress = {
  params: Joi.object().keys({
    addressId: Joi.string().custom(objectId),
  }),
};

const deleteAddress = {
  params: Joi.object().keys({
    addressId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createAddress,
  updateAddress,
  getAddresses,
  getAddress,
  deleteAddress,
};
