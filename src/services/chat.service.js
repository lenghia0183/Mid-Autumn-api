const { Chat, User } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Create a new chat or find existing between user and admin
 * @param {ObjectId} userId
 * @param {ObjectId} adminId
 * @returns {Promise<Chat>}
 */
const createOrFindChat = async (userId, adminId) => {
  let chat = await Chat.findOne({ userId, adminId });

  if (!chat) {
    chat = await Chat.create({
      userId,
      adminId,
      messages: [],
      lastMessage: Date.now(),
    });
  }

  return chat;
};

/**
 * Add a new message to a chat
 * @param {ObjectId} chatId
 * @param {Object} messageData
 * @returns {Promise<Chat>}
 */
const addMessage = async (chatId, messageData) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat not found');
  }

  chat.messages.push(messageData);
  chat.lastMessage = Date.now();
  await chat.save();

  return chat;
};

/**
 * Get all chats for admin
 * @param {ObjectId} adminId
 * @param {Object} options - Query options
 * @returns {Promise<Chat[]>}
 */
const getAdminChats = async (adminId, options = {}) => {
  const { limit = 10, skip = 0, sort = '-lastMessage' } = options;

  const chats = await Chat.find({ adminId })
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('userId', 'fullname email avatar')
    .exec();

  return chats;
};

/**
 * Get chat by ID
 * @param {ObjectId} chatId
 * @returns {Promise<Chat>}
 */
const getChatById = async (chatId) => {
  const chat = await Chat.findById(chatId)
    .populate('userId', 'fullname email avatar')
    .populate('adminId', 'fullname email avatar')
    .exec();

  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat not found');
  }

  return chat;
};

/**
 * Get chat by user and admin IDs
 * @param {ObjectId} userId
 * @param {ObjectId} adminId
 * @returns {Promise<Chat>}
 */
const getChatByUserAndAdmin = async (userId, adminId) => {
  const chat = await Chat.findOne({ userId, adminId })
    .populate('userId', 'fullname email avatar')
    .populate('adminId', 'fullname email avatar')
    .exec();

  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat not found');
  }

  return chat;
};

/**
 * Update message status
 * @param {ObjectId} chatId
 * @param {ObjectId} messageId
 * @param {String} status
 * @returns {Promise<Chat>}
 */
const updateMessageStatus = async (chatId, messageId, status) => {
  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, 'messages._id': messageId },
    { $set: { 'messages.$.status': status } },
    { new: true },
  );

  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat or message not found');
  }

  return chat;
};

/**
 * Get user's chat with admin
 * @param {ObjectId} userId
 * @returns {Promise<Chat>}
 */
const getUserChat = async (userId) => {
  // Find an admin user
  const admin = await User.findOne({ role: 'admin' });

  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No admin found');
  }

  const chat = await createOrFindChat(userId, admin._id);
  return chat;
};

/**
 * Mark all unread messages as read
 * @param {ObjectId} chatId
 * @param {ObjectId} userId
 * @returns {Promise<Chat>}
 */
const markAllMessagesAsRead = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat not found');
  }

  // Get user role to determine which messages to mark as read
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get other user's ID to only mark their messages as read
  const otherUserId = user.role === 'admin' ? chat.userId : chat.adminId;

  // Update all unread messages sent by the other user
  const updatedChat = await Chat.findOneAndUpdate(
    { _id: chatId },
    {
      $set: {
        'messages.$[elem].status': 'read',
      },
    },
    {
      arrayFilters: [
        {
          'elem.sender': otherUserId,
          'elem.status': { $in: ['sent', 'delivered', 'unread'] },
        },
      ],
      new: true,
    },
  );

  return updatedChat;
};

module.exports = {
  createOrFindChat,
  addMessage,
  getAdminChats,
  getChatById,
  getChatByUserAndAdmin,
  updateMessageStatus,
  getUserChat,
  markAllMessagesAsRead,
};
