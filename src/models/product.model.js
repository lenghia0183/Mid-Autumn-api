const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema(
  {
    weight: {
      type: String,
      enum: ['100g', '500g', '1kg'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: [String],
    prices: [priceSchema],
    weight: {
      type: String,
      enum: ['100g', '500g', '1kg'],
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
    ratings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Product', productSchema);
