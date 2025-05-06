const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { visitController } = require('../../controllers');
const { visitValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const visitRouter = express.Router();


visitRouter.post('/', validate(visitValidation.recordVisit), visitController.recordVisit);


visitRouter.get(
  '/statistics',
  authenticate,
  authorize('admin'),
  validate(visitValidation.getVisitStatistics),
  visitController.getVisitStatistics
);

module.exports = visitRouter;
