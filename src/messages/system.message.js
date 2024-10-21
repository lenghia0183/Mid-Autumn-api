const { i18nService } = require('../config');

const systemMessage = () => {
  return {
    RESOURCE_NOT_FOUND: i18nService.translate('system', 'resourceNotFound'),
    IMAGE_TYPE_INVALID: i18nService.translate('system', 'imageTypeInvalid'),
    IMAGE_MAX_SIZE: i18nService.translate('system', 'imageMaxSize'),
  };
};

module.exports = systemMessage;
