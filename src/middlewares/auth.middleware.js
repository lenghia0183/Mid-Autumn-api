const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

const { env } = require('../config');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { authMessage } = require('../messages');
const { REQUEST_USER_KEY } = require('../constants/index');

const authenticate = catchAsync(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, authMessage().UNAUTHORIZED);
  }
  const decoded = jwt.verify(token, env.jwt.secretAccess);
  const user = await User.findByIdAndUpdate(decoded.id, {
    lastActive: Date.now(),
  });
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, authMessage().INVALID_TOKEN);
  }
  if (user.isLocked) {
    throw new ApiError(httpStatus.FORBIDDEN, authMessage().ACCOUNT_LOCKED);
  }

  req[REQUEST_USER_KEY] = user;
  next();
});

const authorize = (rolesAllow) => (req, res, next) => {
  if (!rolesAllow.includes(req[REQUEST_USER_KEY].role)) {
    return next(new ApiError(httpStatus.FORBIDDEN, authMessage().FORBIDDEN));
  }
  next();
};

const flexibleAuth = catchAsync(async (req, res, next) => {
  const token = extractToken(req);

  if (token) {
    try {
      const decoded = jwt.verify(token, env.jwt.secretAccess);
      const user = await User.findByIdAndUpdate(decoded.id, {
        lastActive: Date.now(),
      });

      if (!user) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, authMessage().INVALID_TOKEN));
      }

      if (user.isLocked) {
        return next(new ApiError(httpStatus.FORBIDDEN, authMessage().ACCOUNT_LOCKED));
      }

      req[REQUEST_USER_KEY] = user;
    } catch (error) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, authMessage().INVALID_TOKEN));
    }
  }

  next();
});

const extractToken = (req) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  return token;
};

module.exports = {
  authenticate,
  authorize,
  flexibleAuth,
};
