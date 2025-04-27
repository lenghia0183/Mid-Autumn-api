const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { chatService } = require('../services');
const { REQUEST_USER_KEY } = require('../constants/index');
const response = require('../utils/response');
const { chatMessage } = require('../messages');

const getAdminChats = catchAsync(async (req, res) => {
  const options = {
    limit: parseInt(req.query.limit, 10) || 10,
    skip: parseInt(req.query.skip, 10) || 0,
    sort: req.query.sort || '-lastMessage',
  };

  const chats = await chatService.getAdminChats(req[REQUEST_USER_KEY]._id, options);

  res.status(httpStatus.OK).send(response(httpStatus.OK, chatMessage().FIND_LIST_SUCCESS, chats));
});

const getUserChat = catchAsync(async (req, res) => {
  const chat = await chatService.getUserChat(req[REQUEST_USER_KEY]._id);
  res.status(httpStatus.OK).send(response(httpStatus.OK, chatMessage().FIND_SUCCESS, chat));
});

const getChatById = catchAsync(async (req, res) => {
  const chat = await chatService.getChatById(req.params.chatId);

  res.status(httpStatus.OK).send(response(httpStatus.OK, chatMessage().FIND_LIST_SUCCESS, chat));
});

const sendMessage = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY]._id;
  const { chatId, content } = req.body;

  const messageData = {
    sender: userId,
    content,
    status: 'sent',
  };

  const chat = await chatService.addMessage(chatId, messageData);

  // If socket.io is available, emit a new message event
  const io = req.app.get('io');
  if (io) {
    const message = chat.messages[chat.messages.length - 1];
    const recipientId = req[REQUEST_USER_KEY].role === 'admin' ? chat.userId.toString() : chat.adminId.toString();

    io.to(recipientId).emit('chat:notification', {
      chatId: chat._id,
      message,
    });
  }

  res.status(httpStatus.CREATED).send(response(httpStatus.CREATED, chatMessage().CREATE_SUCCESS, chat));
});

const updateMessageStatus = catchAsync(async (req, res) => {
  const { chatId, messageId, status } = req.body;

  const chat = await chatService.updateMessageStatus(chatId, messageId, status);

  res.status(httpStatus.OK).send(response(httpStatus.OK, chatMessage().UPDATE_SUCCESS, chat));
});

const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req[REQUEST_USER_KEY]._id;
  const { chatId } = req.params;

  const chat = await chatService.markAllMessagesAsRead(chatId, userId);

  res.status(httpStatus.OK).send(response(httpStatus.OK, chatMessage().UPDATE_SUCCESS, chat));
});

module.exports = {
  getAdminChats,
  getUserChat,
  getChatById,
  sendMessage,
  updateMessageStatus,
  markAllAsRead,
};
