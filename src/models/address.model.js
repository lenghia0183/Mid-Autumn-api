const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema(
  {
    provinceName: {
      type: String,
      required: true,
    },
    provinceId: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const districtSchema = new mongoose.Schema(
  {
    districtName: {
      type: String,
      required: true,
    },
    districtId: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const wardSchema = new mongoose.Schema(
  {
    wardName: {
      type: String,
      required: true,
    },
    wardCode: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  province: {
    type: provinceSchema,
    required: true,
  },
  district: {
    type: districtSchema,
    required: true,
  },
  ward: {
    type: wardSchema,
    required: true,
  },
});

module.exports = {
  provinceSchema,
  districtSchema,
  wardSchema,
  addressSchema: mongoose.model('Address', addressSchema),
};
