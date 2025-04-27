const catchAsyncSocket = require('../utils/catchAsyncSocket');
const { chatService } = require('../services');

const chatHandler = (io, socket) => {
  const joinChat = async ({ userId }) => {
    socket.join(`chat:${userId}`);
    await chatService.updateOnlineStatus(userId, true);
  };

  const leaveChat = async ({ userId }) => {
    socket.leave(`chat:${userId}`);
    await chatService.updateOnlineStatus(userId, false);
  };

  const sendMessage = async (data) => {
    try {
      const { userId, content } = data;

      const messageData = {
        sender: socket.user._id,
        content,
        status: 'sent',
      };

      const chat = await chatService.addMessage(userId, messageData);
      const message = chat.messages[chat.messages.length - 1];

      io.to(`chat:${userId}`).emit('message:new', {
        chatId: chat._id,
        userId,
        message,
      });

      socket.emit('message:sent', {
        success: true,
        messageId: message._id,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const markMessageAsRead = async (data) => {
    const { chatId, messageId } = data;

    await chatService.updateMessageStatus(chatId, messageId, 'read');

    io.to(`chat:${chatId}`).emit('message:read', {
      chatId,
      messageId,
    });
  };

  const markMessageAsDelivered = async (data) => {
    const { chatId, messageId } = data;

    await chatService.updateMessageStatus(chatId, messageId, 'delivered');

    io.to(`chat:${chatId}`).emit('message:delivered', {
      chatId,
      messageId,
    });
  };

  const typing = (data) => {
    const { userId } = data;

    socket.to(`chat:${userId}`).emit('user:typing', {
      userId: socket.user._id,
    });
  };

  const stopTyping = (data) => {
    const { userId } = data;

    socket.to(`chat:${userId}`).emit('user:stop-typing', {
      userId: socket.user._id,
    });
  };

  socket.on('chat:join', catchAsyncSocket(joinChat));
  socket.on('chat:leave', catchAsyncSocket(leaveChat));
  socket.on('message:send', catchAsyncSocket(sendMessage));
  socket.on('message:mark-read', catchAsyncSocket(markMessageAsRead));
  socket.on('message:mark-delivered', catchAsyncSocket(markMessageAsDelivered));
  socket.on('user:typing', catchAsyncSocket(typing));
  socket.on('user:stop-typing', catchAsyncSocket(stopTyping));
};

module.exports = chatHandler;
