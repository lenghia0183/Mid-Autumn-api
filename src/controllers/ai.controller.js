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

const translateProductInfo = catchAsync(async (req, res) => {
  const { name, description } = req.body;

  const translations = await aiService.translateProductInfo(name, description);

  res.status(httpStatus.OK).json(response(httpStatus.OK, aiMessage().TRANSLATION_SUCCESS, translations));
});

module.exports = {
  generateProductDescription,
  translateProductInfo,
};
