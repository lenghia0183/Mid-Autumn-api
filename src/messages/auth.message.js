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
    CHANGE_PASSWORD_SUCCESS: i18nService.translate('auth', 'changePasswordSuccess'),
    INVALID_CURRENT_PASSWORD: i18nService.translate('auth', 'invalidCurrentPassword'),
    CAN_NOT_CHANGE_PASSWORD: i18nService.translate('auth', 'canNotChangePassword'),
    INVALID_OTP: i18nService.translate('auth', 'invalidOtp'),
    TOKEN_EXPIRED: i18nService.translate('auth', 'tokenExpired'),
  };
};

module.exports = authMessage;
