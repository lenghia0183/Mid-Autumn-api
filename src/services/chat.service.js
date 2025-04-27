const { Chat, User } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const createOrFindChat = async (userId) => {
  try {
    let chat = await Chat.findOne({ userId })
      .populate('messages.sender', 'fullname email avatar role')
      .populate('userId', 'fullname email avatar');

    if (!chat) {
      chat = await Chat.create({
        userId,
        messages: [],
        lastMessage: Date.now(),
      });
    }

    return chat;
  } catch (error) {
    console.log(error);
  }
};

const addMessage = async (userId, messageData) => {
  let chat = await Chat.findOne({ userId });

  if (!chat) {
    chat = await Chat.create({
      userId,
      messages: [],
      lastMessage: Date.now(),
    });
  }

  chat.messages.push(messageData);
  chat.lastMessage = Date.now();
  await chat.save();

  chat = await Chat.findOne({ userId }).populate('messages.sender', 'fullname email avatar role').exec();

  return chat;
};

const getAdminChats = async (options = {}) => {
  const { limit = 10, skip = 0, sort = '-lastMessage' } = options;
  const chats = await Chat.find().sort(sort).limit(limit).skip(skip).populate('userId', 'fullname email avatar').exec();
  return chats;
};

const getChatById = async (chatId) => {
  let chat = await Chat.findOne({ userId: chatId }).populate('messages.sender', 'fullname email avatar role').exec();

  if (!chat) {
    chat = await Chat.create({
      userId: chatId,
      messages: [],
      lastMessage: Date.now(),
    });
  }

  return chat;
};

const getUserChat = async (userId) => {
  const chat = await createOrFindChat(userId);
  return chat;
};

const updateOnlineStatus = async (userId, isOnline) => {
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  let chat = await Chat.findOne({ userId });
  if (!chat) {
    chat = await Chat.create({
      userId,
      messages: [],
      lastMessage: Date.now(),
    });
  }

  chat.isOnline = isOnline;
  await chat.save();
};

module.exports = {
  createOrFindChat,
  addMessage,
  getAdminChats,
  getChatById,
  getUserChat,
  updateOnlineStatus,
};
