const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['verify email', 'forgot password'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Tài liệu sẽ tự động bị xóa sau 300 giây (5 phút)
  },
});

module.exports = mongoose.model('Otp', otpSchema);
