const express = require('express');
const { paymentController } = require('../../controllers');

const payment = express.Router();

payment.post('/callback/zalo', paymentController.callBackZalo);
payment.post('/callback/momo', paymentController.callBackMoMo);

module.exports = payment;
