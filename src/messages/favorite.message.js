const { i18nService } = require('../config');

const favoriteMessage = () => {
  return {
    ADD_TO_LIST_SUCCESS: i18nService.translate('favorite', 'addToListSuccess'),
    DELETE_SUCCESS: i18nService.translate('favorite', 'deleteSuccess'),
    FIND_LIST_SUCCESS: i18nService.translate('favorite', 'findListSuccess'),
    NOT_FOUND: i18nService.translate('favorite', 'notFound'),
    CLEAR_SUCCESS: i18nService.translate('favorite', 'clearSuccess'),
  };
};

module.exports = favoriteMessage;
