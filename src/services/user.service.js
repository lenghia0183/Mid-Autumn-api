const { User } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { userMessage } = require('../messages');
const ApiFeature = require('../utils/ApiFeature');
const env = require('../config/env.config');

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email }).select('+password');
  return user;
};

const getUserById = async (id) => {
  const user = await User.findById(id).select('+password');
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, userMessage().NOT_FOUND);
  }
  return user;
};

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, userMessage().EXISTS_EMAIL);
  }
  const user = await User.create(userBody);
  user.password = undefined;
  return user;
};

const getUsersByKeyword = async (query) => {
  const apiFeature = new ApiFeature(User);
  const { results, ...detailResult } = await apiFeature.getResults(query, [
    'fullname',
    'email',
    'phone',
    'isLocked',
    'isVerify',
  ]);
  return { users: results, ...detailResult };
};

const updateUserById = async (userId, updateBody) => {
  console.log('updateBody', updateBody);

  const user = await getUserById(userId);
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, userMessage().EXISTS_EMAIL);
  }
  Object.assign(user, updateBody);
  await user.save();
  user.password = undefined;
  return user;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  await user.deleteOne();
  return user;
};

const lockUserById = async (userId) => {
  const user = await getUserById(userId);
  Object.assign(user, { isLocked: !user.isLocked });
  await user.save();
  return user;
};

const createAdmin = async () => {
  const { fullname, email, password } = env.admin;
  let admin = await User.findOne({ email });

  if (!admin) {
    await User.create({ fullname, email, password, role: 'admin' });
  } else {
    admin.fullname = fullname;
    admin.email = email;
    admin.password = password;
    admin.role = 'admin';
    await admin.save();
  }
};

module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
  getUsersByKeyword,
  updateUserById,
  deleteUserById,
  lockUserById,
  createAdmin,
};
