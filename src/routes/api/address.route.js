const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { addressController } = require('../../controllers');
const { addressValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const addressRouter = express.Router();

addressRouter.post(
  '/',
  authenticate,
  authorize('user'),
  validate(addressValidation.createAddress),
  addressController.createAddress,
);

addressRouter.delete(
  '/:addressId',
  authenticate,
  authorize('user'),
  validate(addressValidation.deleteAddress),
  addressController.deleteAddress,
);

addressRouter.put(
  '/:addressId',
  authenticate,
  authorize('user'),
  validate(addressValidation.updateAddress),
  addressController.updateAddress,
);

addressRouter.get(
  '/me',
  authenticate,
  authorize('user'),
  validate(addressValidation.getAddress),
  addressController.getAddresses,
);

module.exports = addressRouter;
