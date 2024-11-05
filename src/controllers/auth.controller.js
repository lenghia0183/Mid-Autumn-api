const httpStatus = require('http-status');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { authService } = require('../services');
const { authMessage } = require('../messages');
const { REQUEST_USER_KEY } = require('../constants');
const { token } = require('morgan');

const getMe = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY].id;
  const user = await authService.getMe(userId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, authMessage().GET_ME_SUCCESS, user));
});

const updateMe = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY].id;
  const updatedUser = await authService.updateMe(userId, req.body);
  res.status(httpStatus.OK).json(response(httpStatus.OK, authMessage().UPDATE_ME_SUCCESS, updatedUser));
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  res
    .status(httpStatus.OK)
    .json(response(httpStatus.OK, authMessage().LOGIN_SUCCESS, { user, accessToken, refreshToken }));
});

const socialLogin = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  const { user, accessToken, refreshToken } = await authService.socialLogin(idToken);
  res
    .status(httpStatus.OK)
    .json(response(httpStatus.OK, authMessage().LOGIN_SUCCESS, { user, accessToken, refreshToken }));
});

const register = catchAsync(async (req, res) => {
  const { fullname, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.register(fullname, email, password);
  res
    .status(httpStatus.CREATED)
    .json(response(httpStatus.CREATED, authMessage().REGISTER_SUCCESS, { user, accessToken, refreshToken }));
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const { accessToken } = await authService.refreshToken(refreshToken);
  res.status(httpStatus.OK).json(response(httpStatus.OK, authMessage().REFRESH_TOKEN_SUCCESS, { accessToken }));
});

const changePassword = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY].id;
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(userId, currentPassword, newPassword);
  res.status(httpStatus.OK).json(response(httpStatus.OK, authMessage().CHANGE_PASSWORD_SUCCESS));
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const tokenForgot = await authService.forgotPassword(email);
  res.status(httpStatus.OK).json(response(httpStatus.OK, authMessage().FORGOT_PASSWORD_SUCCESS, { tokenForgot }));
});

const verifyForgotPasswordOtp = catchAsync(async (req, res) => {
  const tokenVerifyOTP = await authService.verifyForgotPasswordOtp(req.body);
  res
    .status(httpStatus.OK)
    .json(response(httpStatus.OK, authMessage().FORGOT_PASSWORD_OTP_SUCCESS, { tokenVerifyOTP }));
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body);
  res.status(httpStatus.OK).json(response(httpStatus.OK, authMessage().RESET_PASSWORD_SUCCESS));
});

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
