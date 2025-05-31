const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { inventoryController } = require('../../controllers');
const { inventoryValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const inventoryRouter = express.Router();

// Tất cả các route inventory đều yêu cầu authentication và admin role
inventoryRouter.use(authenticate);
inventoryRouter.use(authorize('admin'));

inventoryRouter.post('/add', validate(inventoryValidation.addToInventory), inventoryController.addToInventory);

inventoryRouter.get('/stock', validate(inventoryValidation.getInventoryStock), inventoryController.getInventoryStock);

inventoryRouter.get(
  '/history',
  validate(inventoryValidation.getInventoryHistory),
  inventoryController.getInventoryHistory,
);

inventoryRouter.get('/statistics', inventoryController.getInventoryStatistics);

module.exports = inventoryRouter;
