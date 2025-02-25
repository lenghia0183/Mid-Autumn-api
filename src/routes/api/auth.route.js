const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { authController } = require('../../controllers');
const { authValidation } = require('../../validations');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { uploadService } = require('../../services');
const parserFormData = require('../../middlewares/parserFormData.middleware');

const authRouter = express.Router();

authRouter.route('/me').get(authenticate, validate(authValidation.getMe), authController.getMe);
authRouter
  .route('/me')
  .put(
    authenticate,
    uploadService.uploadImage.single('avatar'),
    parserFormData,
    validate(authValidation.updateMe),
    authController.updateMe,
  );

authRouter
  .route('/change-password')
  .put(authenticate, validate(authValidation.changePassword), authController.changePassword);
authRouter.route('/login').post(validate(authValidation.login), authController.login);
authRouter.route('/social-login').post(validate(authValidation.socialLogin), authController.socialLogin);

authRouter.route('/register').post(validate(authValidation.register), authController.register);

authRouter.route('/refresh-token').post(validate(authValidation.refreshToken), authController.refreshToken);
authRouter.route('/forgot-password').post(validate(authValidation.forgotPassword), authController.forgotPassword);

authRouter
  .route('/verify-forgot-password-otp')
  .post(validate(authValidation.verifyForgotPasswordOtp), authController.verifyForgotPasswordOtp);

authRouter.route('/reset-password').post(validate(authValidation.resetPassword), authController.resetPassword);

module.exports = authRouter;
