const { i18nService } = require('../config');

const productMessage = () => {
  return {
    CREATE_SUCCESS: i18nService.translate('product', 'createSuccess'),
    FIND_LIST_SUCCESS: i18nService.translate('product', 'findSuccess'),
    FIND_SUCCESS: i18nService.translate('product', 'findSuccess'),
    UPDATE_SUCCESS: i18nService.translate('product', 'updateSuccess'),
    DELETE_SUCCESS: i18nService.translate('product', 'deleteSuccess'),
    NOT_FOUND: i18nService.translate('product', 'notFound'),
  };
};

module.exports = productMessage;
