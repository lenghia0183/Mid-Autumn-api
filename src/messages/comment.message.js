const { FORBIDDEN } = require('http-status');
const { i18nService } = require('../config');

const commentMessage = () => {
  return {
    CREATE_SUCCESS: i18nService.translate('comment', 'createSuccess'),
    FIND_LIST_SUCCESS: i18nService.translate('comment', 'findSuccess'),
    FIND_SUCCESS: i18nService.translate('comment', 'findSuccess'),
    UPDATE_SUCCESS: i18nService.translate('comment', 'updateSuccess'),
    DELETE_SUCCESS: i18nService.translate('comment', 'deleteSuccess'),
    NOT_FOUND: i18nService.translate('comment', 'notFound'),
    FORBIDDEN_UPDATE: i18nService.translate('comment', 'forbiddenUpdate'),
  };
};

module.exports = commentMessage;
