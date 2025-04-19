const express = require('express');
const validate = require('../../middlewares/validate.middleware');

const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const { contactValidation } = require('../../validations');
const { contactController } = require('../../controllers');
const contactRouter = express.Router();

contactRouter.post('/', validate(contactValidation.createContact), contactController.createContact);
contactRouter.get(
  '/',
  authenticate,
  authorize('admin'),
  validate(contactValidation.getContacts),
  contactController.getContacts,
);
contactRouter.delete(
  '/:contactId',
  authenticate,
  authorize('admin'),
  validate(contactValidation.deleteContact),
  contactController.deleteContact,
);

module.exports = contactRouter;
