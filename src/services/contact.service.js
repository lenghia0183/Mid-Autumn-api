const httpStatus = require('http-status');
const Contact = require('../models/contact.model');
const ApiError = require('../utils/ApiError');
const ApiFeature = require('../utils/ApiFeature');
const { contactMessage } = require('../messages');

const createContact = async (contactData) => {
  return Contact.create(contactData);
};

const getContactById = async (contactId) => {
  const contact = await Contact.findById({ _id: contactId });
  console.log('contact', contact);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, contactMessage().NOT_FOUND);
  }

  return contact;
};

const getContactsByKeyword = async (query) => {
  const apiFeature = new ApiFeature(Contact);
  const { results, ...detailResult } = await apiFeature.getResults(query, ['fullname']);
  return { contacts: results, ...detailResult };
};

const deleteContact = async (contactId) => {
  const contact = await getContactById(contactId);
  await Contact.deleteOne({ _id: contactId });
  return contact;
};

module.exports = {
  createContact,
  getContactsByKeyword,
  deleteContact,
};
