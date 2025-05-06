const mongoose = require('mongoose');

const visitSchema = mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    referrer: {
      type: String,
    },
    path: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Visit', visitSchema);
