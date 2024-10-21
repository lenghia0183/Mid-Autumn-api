const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active',
    },
    totalMoney: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

cartSchema.statics.recalculateTotalMoney = async function (cartId) {
  const cart = await this.findById(cartId).populate({
    path: 'cartDetails',
    populate: {
      path: 'productId',
    },
  });

  let totalMoney = 0;

  cart.cartDetails.forEach((cartDetail) => {
    totalMoney += cartDetail.quantity * cartDetail.productId.price;
  });

  cart.totalMoney = totalMoney;
  await cart.save();

  return cart.totalMoney;
};

module.exports = mongoose.model('Cart', cartSchema);
