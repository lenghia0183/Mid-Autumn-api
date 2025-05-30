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

const refundMoMoPayment = catchAsync(async (req, res) => {
  const { orderId, amount, description } = req.body;
  const refundResponse = await paymentService.refundMoMoPayment(orderId, amount, description);
  res.status(httpStatus.OK).json(response(httpStatus.OK, paymentMessage().REFUND_SUCCESS, refundResponse));
});

module.exports = {
  callBackZalo,
  callBackMoMo,
  refundMoMoPayment,
};
