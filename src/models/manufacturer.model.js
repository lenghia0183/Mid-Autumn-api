const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Manufacturer', manufacturerSchema);
