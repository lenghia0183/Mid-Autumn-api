const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { statisticValidation } = require('../../validations');
const { statisticController } = require('../../controllers');

const statisticRouter = Router();
statisticRouter.use(authenticate);
statisticRouter.use(authorize('admin'));

statisticRouter.get('/revenue', validate(statisticValidation.getRevenue), statisticController.getRevenue);

statisticRouter
  .route('/top-selling')
  .get(validate(statisticValidation.getTopSellingProducts), statisticController.getTopSellingProducts);

statisticRouter
  .route('/brand-market-share')
  .get(validate(statisticValidation.getBrandMarketShare), statisticController.getBrandMarketShare);

statisticRouter
  .route('/product-distribution')
  .get(validate(statisticValidation.getProductDistribution), statisticController.getProductDistribution);

statisticRouter
  .route('/orders-by-region')
  .get(validate(statisticValidation.getOrdersByRegion), statisticController.getOrdersByRegion);

module.exports = statisticRouter;
