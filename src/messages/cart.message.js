const { i18nService } = require('../config');

const cartMessage = () => {
  return {
    ADD_TO_CART_SUCCESS: i18nService.translate('cart', 'addToCartSuccess'),
    CLEAR_CART_SUCCESS: i18nService.translate('cart', 'clearCartSuccess'),
    FIND_LIST_SUCCESS: i18nService.translate('cart', 'findListSuccess'),
    FIND_SUCCESS: i18nService.translate('cart', 'findSuccess'),
    UPDATE_SUCCESS: i18nService.translate('cart', 'updateSuccess'),
    DELETE_SUCCESS: i18nService.translate('cart', 'deleteSuccess'),
    NOT_FOUND: i18nService.translate('cart', 'notFound'),
    MAX_QUANTITY: i18nService.translate('cart', 'maxQuantity'),
  };
};

module.exports = cartMessage;
