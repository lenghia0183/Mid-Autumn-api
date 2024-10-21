const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { categoryController } = require('../../controllers');
const { categoryValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { uploadService } = require('../../services');
const categoryRouter = express.Router();

categoryRouter.post(
  '/',
  authenticate,
  authorize('admin'),
  uploadService.uploadImage.single('image'),
  validate(categoryValidation.createCategory),
  categoryController.createCategory,
);

categoryRouter.delete(
  '/:categoryId',
  authenticate,
  authorize('admin'),
  validate(categoryValidation.deleteCategory),
  categoryController.deleteCategory,
);

categoryRouter.put(
  '/:categoryId',
  authenticate,
  uploadService.uploadImage.single('image'),
  authorize('admin'),
  validate(categoryValidation.updateCategory),
  categoryController.updateCategory,
);

categoryRouter.get('/', validate(categoryValidation.getCategories), categoryController.getCategories);

module.exports = categoryRouter;
