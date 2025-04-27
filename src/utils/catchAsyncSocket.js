const { logger } = require('../config');

const catchAsyncSocket = (fn) => (socket, next) => {
  Promise.resolve(fn(socket, next)).catch((err) => {
    logger.error(err);
  });
};

module.exports = catchAsyncSocket;
