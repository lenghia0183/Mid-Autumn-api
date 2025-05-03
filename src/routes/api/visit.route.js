const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { visitController } = require('../../controllers');
const { visitValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const visitRouter = express.Router();

// Public endpoint for recording visits - no authentication required
visitRouter.post('/', validate(visitValidation.recordVisit), visitController.recordVisit);

// Admin-only endpoint for retrieving visit statistics
visitRouter.get(
  '/statistics',
  authenticate,
  authorize('admin'),
  validate(visitValidation.getVisitStatistics),
  visitController.getVisitStatistics
);

module.exports = visitRouter;
