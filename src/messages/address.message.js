const { i18nService } = require('../config');

const addressMessage = () => {
  return {
    CREATE_SUCCESS: i18nService.translate('address', 'createSuccess'),
    FIND_LIST_SUCCESS: i18nService.translate('address', 'findSuccess'),
    FIND_SUCCESS: i18nService.translate('address', 'findSuccess'),
    UPDATE_SUCCESS: i18nService.translate('address', 'updateSuccess'),
    DELETE_SUCCESS: i18nService.translate('address', 'deleteSuccess'),
    NOT_FOUND: i18nService.translate('address', 'notFound'),
  };
};

module.exports = addressMessage;
