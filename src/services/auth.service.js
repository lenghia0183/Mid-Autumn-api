const jwt = require('jsonwebtoken');
const { admin } = require('./../firebase.config');
const { env } = require('../config');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { userMessage, authMessage } = require('../messages');
const userService = require('./user.service');
const { User, Otp } = require('../models');
const generateOTP = require('../utils/generateOtp');
const emailService = require('../services/email.service');
const cryptoService = require('./crypto.service');
const { TOKEN_TYPE } = require('../constants');

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
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().INVALID_LOGIN);
  }
  if (user.isLocked) {
    throw new ApiError(httpStatus.BAD_REQUEST, userMessage().USER_LOCKED);
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

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userService.getUserById(userId);

  if (user?.fireBaseId) {
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().CAN_NOT_CHANGE_PASSWORD);
  }

  if (!(await user.isPasswordMatch(currentPassword))) {
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().INVALID_CURRENT_PASSWORD);
  }

  user.password = newPassword;
  await user.save();
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

const forgotPassword = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, userMessage().NOT_FOUND);
  }

  const otp = generateOTP();
  const expires = Date.now() + 300000;
  const tokenForgot = cryptoService.encryptObj(
    {
      otp,
      email,
      expires,
      type: TOKEN_TYPE.FORGOT_PASSWORD,
    },
    env.jwt.secretForgotPassword,
  );

  await emailService.sendEmail({
    subject: 'forgot password',
    to: email,
    templatePath: '../template/otp.template.ejs',
    templateData: {
      name: user?.fullname,
      otp: otp,
    },
  });

  return tokenForgot;
};

const verifyForgotPasswordOtp = async ({ tokenForgot, otp }) => {
  const { isExpired, payload } = cryptoService.expiresCheck(tokenForgot, env.jwt.secretForgotPassword);

  if (isExpired) {
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().TOKEN_EXPIRED);
  }

  if (payload.type != TOKEN_TYPE.FORGOT_PASSWORD) {
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().INVALID_TOKEN);
  }

  if (payload.otp != otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().INVALID_OTP);
  }

  const user = await userService.getUserByEmail(payload.email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, userMessage().NOT_FOUND);
  }

  const expires = Date.now() + 300000;

  const tokenVerifyOTP = cryptoService.encryptObj(
    {
      expires,
      email: user.email,
      type: TOKEN_TYPE.VERIFY_OTP,
    },
    env.jwt.secretVerifyOtp,
  );

  return tokenVerifyOTP;
};

const resetPassword = async ({ tokenVerifyOtp, newPassword }) => {
  const { isExpired, payload } = cryptoService.expiresCheck(tokenVerifyOtp, env.jwt.secretVerifyOtp);

  if (isExpired) {
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().TOKEN_EXPIRED);
  }

  if (payload.type != TOKEN_TYPE.VERIFY_OTP) {
    throw new ApiError(httpStatus.BAD_REQUEST, authMessage().INVALID_TOKEN);
  }

  const user = await userService.getUserByEmail(payload.email);

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, userMessage().NOT_FOUND);
  }

  user.password = newPassword;
  await user.save();
};

module.exports = {
  login,
  register,
  refreshToken,
  socialLogin,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
};
