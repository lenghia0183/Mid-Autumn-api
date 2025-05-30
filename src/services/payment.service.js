const httpStatus = require('http-status');
const { orderService, cartService } = require('../services');
const { paymentMessage } = require('../messages');
const ApiError = require('../utils/ApiError');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');
const { env } = require('../config');

const zaloConfig = {
  app_id: env.zalo.appId,
  key1: env.zalo.key1,
  key2: env.zalo.key2,
  endpoint: env.zalo.apiUrl,
  redirecturl: env.zalo.redirectUrl,
  app_user: env.zalo.appUser,
  callback_url: env.zalo.callbackUrl,
};

const paymentWithMoMo = async (order, cart) => {
  var accessKey = env.momo.accessKey.toString();
  var secretKey = env.momo.secretKey.toString();
  var orderInfo = paymentMessage()
    .PAYMENT_DESCRIPTION.replace('{{userId}}', order?.userId)
    .replace('{{orderId}}', order?.id);
  var partnerCode = env.momo.partnerCode;
  var redirectUrl = env.momo.redirectUrl;
  var ipnUrl = env.momo.ipnUrl;
  var requestType = 'payWithMethod';
  var amount = order?.totalAmount?.toString();
  var orderId = order?.id;
  var requestId = orderId;
  var extraData = '';
  var orderGroupId = '';
  var autoCapture = true;
  var lang = 'vi';

  const rawSignature =
    'accessKey=' +
    accessKey +
    '&amount=' +
    amount +
    '&extraData=' +
    extraData +
    '&ipnUrl=' +
    ipnUrl +
    '&orderId=' +
    orderId +
    '&orderInfo=' +
    orderInfo +
    '&partnerCode=' +
    partnerCode +
    '&redirectUrl=' +
    redirectUrl +
    '&requestId=' +
    requestId +
    '&requestType=' +
    requestType;

  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const requestBody = JSON.stringify({
    partnerCode,
    partnerName: env.momo.partnerName,
    storeId: env.momo.storeId,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    orderGroupId,
    signature,
  });

  try {
    const options = {
      method: 'POST',
      url: env.momo.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };

    const response = await axios(options);

    if (response.data.resultCode === 0) {
      cart.status = 'inactive';
      await cart.save();
    }

    return response.data;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, paymentMessage().PAYMENT_FAILURE);
  }
};

const paymentWithZaloPay = async (order, cart) => {
  const embed_data = {
    redirecturl: zaloConfig.redirecturl,
    orderId: order?.id,
  };

  const items = [{}];

  const transID = Math.floor(Math.random() * 1000000);

  const orderData = {
    app_id: zaloConfig.app_id,
    app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
    app_user: zaloConfig.app_user,
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: order?.totalAmount, // Lấy số tiền từ đối tượng order
    description: paymentMessage()
      .PAYMENT_DESCRIPTION.replace('{{userId}}', order?.userId)
      .replace('{{orderId}}', order?.id),
    bank_code: '',
    callback_url: zaloConfig.callback_url,
  };

  // Tạo dữ liệu để tính toán chữ ký
  const data = [
    zaloConfig.app_id,
    orderData.app_trans_id,
    orderData.app_user,
    orderData.amount,
    orderData.app_time,
    orderData.embed_data,
    orderData.item,
  ].join('|');

  orderData.mac = crypto.createHmac('sha256', zaloConfig.key1).update(data).digest('hex');

  try {
    const response = await axios.post(zaloConfig.endpoint, null, { params: orderData });

    if (response.data.return_code === 1) {
      cart.status = 'inactive';
      await cart.save();
    }

    return response.data;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, paymentMessage().PAYMENT_FAILURE);
  }
};

const callbackMoMo = async (callbackData) => {
  const { orderId, resultCode, transId } = callbackData;
  console.log('callBackData', callbackData);

  if (resultCode === 0) {
    await orderService.updateOrderById(orderId, {
      isPaid: true,
      momoTransId: transId,
    });
  }
  return;
};

const callBackZalo = async (callbackData) => {
  let result = {};

  try {
    let dataStr = callbackData.data;
    let reqMac = callbackData.mac;

    let mac = crypto.createHmac('sha256', zaloConfig.key2).update(dataStr).digest('hex');

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = 'mac not equal';
    } else {
      let dataJson = JSON.parse(dataStr);
      let embedDataJson = JSON.parse(dataJson?.embed_data);

      await orderService.updateOrderById(embedDataJson?.orderId, { isPaid: true });

      result.return_code = 1;
      result.return_message = 'success';
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  return result;
};

const refundMoMoPayment = async (orderId, amount, description) => {
  try {
    const order = await orderService.getOrderById(orderId);
    if (!order || !order.isPaid) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Order not found or not paid');
    }

    const transId = order.momoTransId || '';

    const accessKey = env.momo.accessKey.toString();
    const secretKey = env.momo.secretKey.toString();
    const partnerCode = env.momo.partnerCode;
    const requestId = `${moment().format('YYYYMMDD')}_${Math.floor(Math.random() * 1000000)}`;

    const amountStr = amount.toString();

    const rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amountStr +
      '&description=' +
      description +
      '&orderId=' +
      orderId +
      '&partnerCode=' +
      partnerCode +
      '&requestId=' +
      requestId +
      '&transId=' +
      transId;

    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const requestBody = JSON.stringify({
      partnerCode,
      orderId,
      requestId,
      amount: amountStr,
      transId,
      lang: 'vi',
      description,
      signature,
    });

    console.log('MoMo Refund Request:', JSON.parse(requestBody));

    const options = {
      method: 'POST',
      url: env.momo.refundUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestBody,
    };

    const response = await axios(options);
    console.log('MoMo Refund Response:', response.data);

    if (response.data.resultCode === 0) {
      await orderService.updateOrderById(orderId, { isRefunded: true });
    }

    return response.data;
  } catch (error) {
    console.error('MoMo Refund Error:', error.response?.data || error.message);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.response?.data?.message || paymentMessage().REFUND_FAILURE,
    );
  }
};

module.exports = {
  paymentWithMoMo,
  paymentWithZaloPay,
  callBackZalo,
  callbackMoMo,
  refundMoMoPayment,
};
