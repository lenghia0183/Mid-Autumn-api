const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { manufacturerController } = require('../../controllers');
const { manufacturerValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { uploadService } = require('../../services');
const manufacturerRouter = express.Router();

manufacturerRouter.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(manufacturerValidation.createManufacturer),
  manufacturerController.createManufacturer,
);

manufacturerRouter.delete(
  '/:manufacturerId',
  authenticate,
  authorize('admin'),
  validate(manufacturerValidation.deleteManufacturer),
  manufacturerController.deleteManufacturer,
);

manufacturerRouter.put(
  '/:manufacturerId',
  authenticate,
  uploadService.uploadImage.single('image'),
  authorize('admin'),
  validate(manufacturerValidation.updateManufacturer),
  manufacturerController.updateManufacturer,
);

manufacturerRouter.get('/', validate(manufacturerValidation.getManufacturers), manufacturerController.getManufacturers);
manufacturerRouter.get(
  '/:manufacturerId',
  validate(manufacturerValidation.getManufacturer),
  manufacturerController.getManufacturer,
);

module.exports = manufacturerRouter;
