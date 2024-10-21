const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { orderController } = require('../../controllers');
const { orderValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const orderRouter = express.Router();

orderRouter.post('/', authenticate, validate(orderValidation.createOrder), orderController.createOrder);
orderRouter.put(
  'change-status/:orderId',
  authenticate,
  validate(orderValidation.updateOrderStatus),
  orderController.updateOrderStatus,
);

orderRouter.get('/me', authenticate, validate(orderValidation.getOrdersByUserId), orderController.getOrdersByUserId);
orderRouter.get('/:orderId', authenticate, validate(orderValidation.getOrderById), orderController.getOrderById);
orderRouter.get('/', authenticate, authorize('admin'), validate(orderValidation.getOrders), orderController.getOrders);
orderRouter.put('/:orderId', authenticate, validate(orderValidation.updateOrderById), orderController.updateOrderById);

module.exports = orderRouter;
