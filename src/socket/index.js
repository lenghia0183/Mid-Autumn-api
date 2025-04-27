const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { env, logger } = require('../config');
const { User } = require('../models');
const chatHandler = require('./chat.handler');
const httpStatus = require('http-status');
const catchAsyncSocket = require('../utils/catchAsyncSocket');
const ApiError = require('../utils/ApiError');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(
    catchAsyncSocket(async (socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authentication error'));
      }

      const decoded = jwt.verify(token, env.jwt.secretAccess);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication error');
      }

      if (user.isLocked) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is locked');
      }

      socket.user = user;
      next();
    }),
  );

  io.on('connection', (socket) => {
    socket.join(socket.user._id.toString());

    chatHandler(io, socket);

    socket.on('disconnect', () => {
      socket.leave(socket.user._id.toString());
      logger.info(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

module.exports = setupSocket;
