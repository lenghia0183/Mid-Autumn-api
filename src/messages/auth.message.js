const { i18nService } = require('../config');

const authMessage = () => {
  return {
    INVALID_LOGIN: i18nService.translate('auth', 'invalidLogin'),
    LOGIN_SUCCESS: i18nService.translate('auth', 'loginSuccess'),
    REGISTER_SUCCESS: i18nService.translate('auth', 'registerSuccess'),
    REFRESH_TOKEN_SUCCESS: i18nService.translate('auth', 'refreshTokenSuccess'),
    INVALID_TOKEN: i18nService.translate('auth', 'invalidToken'),
    UNAUTHORIZED: i18nService.translate('auth', 'unauthorized'),
    FORBIDDEN: i18nService.translate('auth', 'forbidden'),
    ACCOUNT_LOCKED: i18nService.translate('auth', 'accountLocked'),
    GET_ME_SUCCESS: i18nService.translate('auth', 'getMeSuccess'),
    UPDATE_ME_SUCCESS: i18nService.translate('auth', 'updateMeSuccess'),
  };
};

module.exports = authMessage;
