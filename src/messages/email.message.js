const { i18nService } = require('../config');

const emailMessage = () => {
  return {
    SEND_EMAIL_SUCCESS: i18nService.translate('email', 'sendEmailSuccess'),
    SEND_EMAIL_FAILURE: i18nService.translate('email', 'sendEmailFailure'),
    EMAIL_NOT_FOUND: i18nService.translate('email', 'emailNotFound'),
  };
};

module.exports = emailMessage;
