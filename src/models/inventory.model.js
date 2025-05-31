const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['import', 'export'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index để tối ưu hóa truy vấn
inventorySchema.index({ productId: 1, createdAt: -1 });
inventorySchema.index({ type: 1, createdAt: -1 });
inventorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Inventory', inventorySchema);
