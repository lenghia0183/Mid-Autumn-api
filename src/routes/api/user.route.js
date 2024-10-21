const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { userController } = require('../../controllers');
const { userValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const userRouter = express.Router();

userRouter.use(authenticate);
userRouter.use(authorize('admin'));

userRouter
  .route('/')
  .get(validate(userValidation.getUsers), userController.getUsers)
  .post(validate(userValidation.createUser), userController.createUser);

userRouter
  .route('/:userId')
  .get(validate(userValidation.getUser), userController.getUser)
  .put(validate(userValidation.updateUser), userController.updateUser)
  .delete(validate(userValidation.deleteUser), userController.deleteUser)
  .options(validate(userValidation.lockUser), userController.lockUser);

module.exports = userRouter;
