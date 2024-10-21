const { i18nService } = require('../config');

const cartMessage = () => {
  return {
    CREATE_SUCCESS: i18nService.translate('order', 'createSuccess'),
    FIND_LIST_SUCCESS: i18nService.translate('order', 'findListSuccess'),
    UPDATE_SUCCESS: i18nService.translate('order', 'updateSuccess'),
    NOT_FOUND: i18nService.translate('order', 'notFound'),
    CANNOT_CANCEL_ORDER: i18nService.translate('order', 'canNotCancelOrder'),
    FORBIDDEN: i18nService.translate('order', 'forbidden'),
    INVALID_CART: i18nService.translate('order', 'invalidCart'),
  };
};

module.exports = cartMessage;
