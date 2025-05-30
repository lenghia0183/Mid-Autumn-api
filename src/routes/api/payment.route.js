const express = require('express');
const { paymentController } = require('../../controllers');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { paymentValidation } = require('../../validations');

const payment = express.Router();

payment.post('/callback/zalo', paymentController.callBackZalo);
payment.post('/callback/momo', paymentController.callBackMoMo);
payment.post(
  '/refund/momo',
  authenticate,
  authorize('admin'),
  validate(paymentValidation.refundMoMoPayment),
  paymentController.refundMoMoPayment,
);

module.exports = payment;
