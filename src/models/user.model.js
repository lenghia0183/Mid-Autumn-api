const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { provinceSchema, districtSchema, wardSchema } = require('./address.model');

const userSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      select: false,
      required: function () {
        return !this.fireBaseId;
      },
    },

    address: {
      province: {
        type: provinceSchema,
      },
      district: {
        type: districtSchema,
      },
      ward: {
        type: wardSchema,
      },
      street: {
        type: String,
      },
    },

    fireBaseId: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    isVerify: {
      type: Boolean,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: 'https://hitly.vn/avatar-default',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password') && user.password) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};

module.exports = mongoose.model('User', userSchema);
