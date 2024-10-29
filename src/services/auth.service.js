const jwt = require('jsonwebtoken');
const { admin } = require('./../firebase.config');

const { env } = require('../config');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { userMessage, authMessage } = require('../messages');
const userService = require('./user.service');
const { User } = require('../models');

const getMe = async (userId) => {
  const user = await userService.getUserById(userId);

  user.password = undefined;
  return user;
};

const updateMe = async (userId, updateBody) => {
  const user = await userService.getUserById(userId);

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, userMessage().EXISTS_EMAIL);
  }
  Object.assign(user, updateBody);
  await user.save();
  user.password = undefined;
  return user;
};

const login = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, authMessage().INVALID_LOGIN);
  }
  if (user.isLocked) {
    throw new ApiError(httpStatus.UNAUTHORIZED, userMessage().USER_LOCKED);
  }
  const accessToken = generateToken('access', { id: user.id, email, role: user.role });
  const refreshToken = generateToken('refresh', { id: user.id });
  user.lastActive = Date.now();
  await user.save();
  user.password = undefined;

  return { user, accessToken, refreshToken };
};

const register = async (fullname, email, password) => {
  const registerData = {
    fullname,
    email,
    password,
  };
  const user = await userService.createUser(registerData);
  const accessToken = generateToken('access', { id: user.id, email, role: user.role });
  const refreshToken = generateToken('refresh', { id: user.id });
  return { user, accessToken, refreshToken };
};

const socialLogin = async (idToken) => {
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, authMessage().INVALID_TOKEN);
  }

  const { email, uid, name, picture } = decodedToken;
  let user = await userService.getUserByEmail(email);
  if (!user?.fireBaseId && user) {
    throw new ApiError(httpStatus.BAD_REQUEST, userMessage().EXISTS_EMAIL);
  }
  if (!user) {
    user = await userService.createUser({
      fullname: name || '',
      avatar: picture,
      email,
      fireBaseId: uid,
      password: null,
      isLocked: false,
    });
  }

  if (user.isLocked) {
    throw new ApiError(httpStatus.UNAUTHORIZED, userMessage().USER_LOCKED);
  }

  const accessToken = generateToken('access', { id: user.id, email: user.email, role: user.role });
  const refreshToken = generateToken('refresh', { id: user.id });

  user.lastActive = Date.now();
  await user.save();

  user.password = undefined;

  return { user, accessToken, refreshToken };
};

const refreshToken = async (refreshToken) => {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwt.secretRefresh);
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().INVALID_TOKEN);
  }
  if (!payload || payload.type !== 'refresh') {
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().INVALID_TOKEN);
  }
  const user = await userService.getUserById(payload.id);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().INVALID_TOKEN);
  }
  if (user.isLocked) {
    throw new ApiError(httpStatus.BAD_REQUEST, userMessage().USER_LOCKED);
  }
  const accessToken = generateToken('access', { id: user.id, email: user.email, role: user.role });
  return { accessToken };
};

const generateToken = (type, payload) => {
  const secret = type === 'access' ? env.jwt.secretAccess : env.jwt.secretRefresh;

  const expiresIn = type === 'access' ? env.jwt.expiresAccessToken : env.jwt.expiresRefreshToken;

  const token = jwt.sign({ ...payload, type }, secret, {
    expiresIn,
  });
  return token;
};

module.exports = {
  login,
  register,
  refreshToken,
  socialLogin,
  getMe,
  updateMe,
};
