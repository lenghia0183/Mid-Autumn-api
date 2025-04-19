const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createContact = {
  body: Joi.object().keys({
    fullname: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    content: Joi.string().required(),
  }),
};

const getContacts = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    keyword: Joi.string().allow('', null),
  }),
};

const deleteContact = {
  params: Joi.object().keys({
    contactId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createContact,
  getContacts,
  deleteContact,
};
