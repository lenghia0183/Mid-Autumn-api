const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { statisticValidation } = require('../../validations');
const { statisticController } = require('../../controllers');

const statisticRouter = Router();
statisticRouter.use(authenticate);
statisticRouter.use(authorize('admin'));

statisticRouter.get('/revenue', validate(statisticValidation.getRevenue), statisticController.getRevenue);

module.exports = statisticRouter;
