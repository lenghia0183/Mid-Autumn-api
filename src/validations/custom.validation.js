const { userMessage } = require('../messages');

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" ' + userMessage().INCORRECT_ID);
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message(userMessage().PASSWORD_LENGTH);
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(userMessage().PASSWORD_INVALID);
  }
  return value;
};

const email = (value, helpers) => {
  if (!value.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)) {
    return helpers.message(userMessage().EMAIL_INVALID);
  }
  return value;
};

const role = (value, helpers) => {
  if (!value.match(/^(admin|user|shop)$/)) {
    return helpers.message(userMessage().ROLE_INVALID);
  }
  return value;
};

const fullname = (value, helpers) => {
  if ((value && value.length < 3) || value.length > 50) {
    return helpers.message(userMessage().FULLNAME_LENGTH);
  }
  return value;
};

const phone = (value, helpers) => {
  if ((value && value.length < 8) || value.length > 13) {
    return helpers.message(userMessage().PHONE_LENGTH);
  }
  return value;
};

module.exports = {
  objectId,
  password,
  email,
  role,
  fullname,
  phone,
};
