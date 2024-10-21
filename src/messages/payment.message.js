const { i18nService } = require('../config');

const paymentMessage = () => {
  return {
    PAYMENT_FAILURE: i18nService.translate('payment', 'paymentFailure'),
    PAYMENT_DESCRIPTION: i18nService.translate('payment', 'paymentDescription'),
  };
};

module.exports = paymentMessage;
