const { i18nService } = require('../config');

const aiMessage = () => {
  return {
    GENERATION_SUCCESS: i18nService.translate('ai', 'generationSuccess'),
    GENERATION_FAILURE: i18nService.translate('ai', 'generationFailure'),
    PROMPT_REQUIRED: i18nService.translate('ai', 'promptRequired'),
  };
};

module.exports = aiMessage;
