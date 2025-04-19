const { i18nService } = require('../config');

const contactMessage = () => {
  return {
    CREATE_SUCCESS: i18nService.translate('contact', 'createSuccess'),
    DELETE_SUCCESS: i18nService.translate('contact', 'deleteSuccess'),
    FIND_LIST_SUCCESS: i18nService.translate('contact', 'findListSuccess'),
    NOT_FOUND: i18nService.translate('contact', 'notFound'),
  };
};

module.exports = contactMessage;
