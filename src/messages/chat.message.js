const { i18nService } = require('../config');

const chatMessage = () => {
  return {
    CREATE_SUCCESS: i18nService.translate('chat', 'createSuccess'),
    FIND_LIST_SUCCESS: i18nService.translate('chat', 'findSuccess'),
    FIND_SUCCESS: i18nService.translate('chat', 'findSuccess'),
    UPDATE_SUCCESS: i18nService.translate('chat', 'updateSuccess'),

    NOT_FOUND: i18nService.translate('chat', 'notFound'),
  };
};

module.exports = chatMessage;
