const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { aiService } = require('../services');
const { aiMessage } = require('../messages');
const response = require('../utils/response');

const generateProductDescription = catchAsync(async (req, res) => {
  const { prompt } = req.body;

  const description = await aiService.generateProductDescription(prompt);

  res.status(httpStatus.OK).json(response(httpStatus.OK, aiMessage().GENERATION_SUCCESS, { description }));
});

module.exports = {
  generateProductDescription,
};
