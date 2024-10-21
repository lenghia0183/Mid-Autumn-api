const httpStatus = require('http-status');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');

const callBackZalo = catchAsync(async (req, res) => {
  const callbackResponse = await paymentService.callBackZalo(req.body);
  res.json(callbackResponse);
});

const callBackMoMo = catchAsync(async (req, res) => {
  const callbackResponse = await paymentService.callbackMoMo(req.body);
  res.json(callbackResponse);
});

module.exports = {
  callBackZalo,
  callBackMoMo,
};
