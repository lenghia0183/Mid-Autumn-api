const { Chat } = require('../models');
const { chatService } = require('../services');

const chatHandler = (io, socket) => {
  const joinChat = async (chatId) => {
    console.log('joinChat', chatId);
    socket.join(`chat:${chatId}`);
  };

  const leaveChat = (chatId) => {
    socket.leave(`chat:${chatId}`);
  };

  const sendMessage = async (data) => {
    try {
      const { chatId, content } = data;

      const messageData = {
        sender: socket.user._id,
        content,
        status: 'sent',
      };

      const chat = await chatService.addMessage(chatId, messageData);
      const message = chat.messages[chat.messages.length - 1];

      io.to(`chat:${chatId}`).emit('message:new', {
        chatId,
        message,
      });

      const recipientId = socket.user.role === 'admin' ? chat.userId.toString() : chat.adminId.toString();

      io.to(recipientId).emit('chat:notification', {
        chatId,
        message,
      });

      socket.emit('message:sent', {
        success: true,
        messageId: message._id,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message:sent', {
        success: false,
        error: error.message,
      });
    }
  };

  const markMessageAsRead = async (data) => {
    try {
      const { chatId, messageId } = data;

      await chatService.updateMessageStatus(chatId, messageId, 'read');

      io.to(`chat:${chatId}`).emit('message:read', {
        chatId,
        messageId,
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markMessageAsDelivered = async (data) => {
    try {
      const { chatId, messageId } = data;

      await chatService.updateMessageStatus(chatId, messageId, 'delivered');

      io.to(`chat:${chatId}`).emit('message:delivered', {
        chatId,
        messageId,
      });
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  };

  const typing = (data) => {
    const { chatId } = data;

    socket.to(`chat:${chatId}`).emit('user:typing', {
      chatId,
      userId: socket.user._id,
    });
  };

  const stopTyping = (data) => {
    const { chatId } = data;

    socket.to(`chat:${chatId}`).emit('user:stop-typing', {
      chatId,
      userId: socket.user._id,
    });
  };

  socket.on('chat:join', joinChat);
  socket.on('chat:leave', leaveChat);
  socket.on('message:send', sendMessage);
  socket.on('message:mark-read', markMessageAsRead);
  socket.on('message:mark-delivered', markMessageAsDelivered);
  socket.on('user:typing', typing);
  socket.on('user:stop-typing', stopTyping);
};

module.exports = chatHandler;
