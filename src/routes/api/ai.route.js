const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { aiController } = require('../../controllers');
const { aiValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const aiRouter = express.Router();

aiRouter.post(
  '/product-description',
  authenticate,
  authorize('admin'),
  validate(aiValidation.generateProductDescription),
  aiController.generateProductDescription,
);

module.exports = aiRouter;
