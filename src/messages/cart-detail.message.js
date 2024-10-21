const { i18nService } = require('../config');

const cartDetailMessage = () => {
  return {
    FIND_SUCCESS: i18nService.translate('cartDetail', 'findSuccess'),
    UPDATE_SUCCESS: i18nService.translate('cartDetail', 'updateSuccess'),
    DELETE_SUCCESS: i18nService.translate('cartDetail', 'deleteSuccess'),
    NOT_FOUND: i18nService.translate('cartDetail', 'notFound'),
  };
};

module.exports = cartDetailMessage;
