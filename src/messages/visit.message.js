const i18n = require('i18n');

const visitMessage = () => {
  return {
    CREATE_SUCCESS: i18n.__('visit').CREATE_SUCCESS,
    FIND_LIST_SUCCESS: i18n.__('visit').FIND_LIST_SUCCESS,
    NOT_FOUND: i18n.__('visit').NOT_FOUND,
  };
};

module.exports = visitMessage;
