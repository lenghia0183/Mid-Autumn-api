const mongoose = require('mongoose');
const { provinceSchema, districtSchema, wardSchema } = require('./address.model');

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    cartDetails: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CartDetail',
        required: true,
      },
    ],

    buyerName: {
      type: String,
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    buyerPhone: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    recipientPhone: {
      type: String,
      required: true,
    },

    address: {
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
      street: {
        type: String,
        required: true,
      },
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'reject', 'shipping', 'success', 'canceled'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Bank'],
      required: true,
    },
    paymentGateway: {
      type: String,
      enum: ['MoMo', 'ZaloPay', 'VnPay'],
      required: function () {
        return this.paymentMethod === 'Bank';
      },
    },
    isPaid: {
      type: Boolean,
      default: false,
      required: function () {
        return this.paymentMethod === 'Bank';
      },
    },
    payUrl: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Order', orderSchema);
