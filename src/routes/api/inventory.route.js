const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { inventoryController } = require('../../controllers');
const { inventoryValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const inventoryRouter = express.Router();

inventoryRouter.use(authenticate);
inventoryRouter.use(authorize('admin'));

inventoryRouter.post('/add', validate(inventoryValidation.addToInventory), inventoryController.addToInventory);

inventoryRouter.get('/stock', validate(inventoryValidation.getInventoryStock), inventoryController.getInventoryStock);

inventoryRouter.get(
  '/history',
  validate(inventoryValidation.getInventoryHistory),
  inventoryController.getInventoryHistory,
);

inventoryRouter.get(
  '/:inventoryId',
  validate(inventoryValidation.getInventoryById),
  inventoryController.getInventoryById,
);

inventoryRouter.put(
  '/:inventoryId',
  validate(inventoryValidation.updateInventory),
  inventoryController.updateInventory,
);

module.exports = inventoryRouter;
