const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nameEn: {
      type: String,
      required: false,
    },
    nameZh: {
      type: String,
      required: false,
    },
    nameJa: {
      type: String,
      required: false,
    },
    code: {
      type: String,
      required: true,
    },
    images: [String],
    price: {
      type: Number,
      required: true,
    },
    costPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    manufacturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manufacturer',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    descriptionEn: {
      type: String,
      default: '',
    },
    descriptionZh: {
      type: String,
      default: '',
    },
    descriptionJa: {
      type: String,
      default: '',
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Product', productSchema);
