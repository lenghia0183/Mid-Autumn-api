const httpStatus = require('http-status');
const { contactService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const { contactMessage } = require('../messages');
const response = require('../utils/response');

const createContact = catchAsync(async (req, res) => {
  const contact = await contactService.createContact(req.body);
  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, contactMessage().CREATE_SUCCESS, contact));
});

const getContacts = catchAsync(async (req, res) => {
  const contacts = await contactService.getContactsByKeyword(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, contactMessage().FIND_LIST_SUCCESS, contacts));
});

const deleteContact = catchAsync(async (req, res) => {
  const contact = await contactService.deleteContact(req.params.contactId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, contactMessage().DELETE_SUCCESS, contact));
});

const getContactById = catchAsync(async (req, res) => {
  const contact = await contactService.getContactById(req.params.contactId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, contactMessage().FIND_SUCCESS, contact));
});

module.exports = {
  createContact,
  getContacts,
  deleteContact,
  getContactById,
};
