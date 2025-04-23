const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { env, logger } = require('../config');
const { User } = require('../models');
const chatHandler = require('./chat.handler');
const ApiError = require('../utils/ApiError');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log('token', token);
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, env.jwt.secretAccess);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('Authentication error'));
      }

      if (user.isLocked) {
        return next(new Error('Account is locked'));
      }

      socket.user = user;
      next();
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication error');
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user._id}`);

    socket.join(socket.user._id.toString());

    chatHandler(io, socket);

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

module.exports = setupSocket;
