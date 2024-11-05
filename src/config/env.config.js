require('dotenv').config();

const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-mart-api',
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@grocery-mart.com',
    password: process.env.ADMIN_PASSWORD || 'admin@12345',
    fullname: process.env.ADMIN_NAME || 'Admin Grocery Mart',
  },
  jwt: {
    secretAccess: process.env.SECRET_ACCESS_TOKEN || 'secret-access',
    secretRefresh: process.env.SECRET_REFRESH_TOKEN || 'secret-refresh',

    expiresAccessToken: process.env.EXPIRES_ACCESS_MINUTES + 'm' || '100m',
    expiresRefreshToken: process.env.EXPIRES_REFRESH_MINUTES + 'm' || '1000m',

    secretForgotPassword: process.env.SECRET_FORGOT_PASSWORD_TOKEN || 'forgot-password',
    secretVerifyOtp: process.env.SECRET_VERIFY_OTP_TOKEN || 'verify-otp',

    expiresForgotPasswordToken: parseInt(process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_MINUTES) * 60 * 1000 || 300000,
    expiresVerifyOtpToken: parseInt(process.env.VERIFY_OTP_TOKEN_EXPIRE_MINUTES) * 60 * 1000 || 300000,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },

  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    partnerName: process.env.MOMO_PARTNER_NAME,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    apiUrl: process.env.MOMO_API_URL || 'https://test-payment.momo.vn/gw_payment/transactionProcessor',
    returnUrl: process.env.MOMO_RETURN_URL,
    ipnUrl: process.env.MOMO_IPN_URL,
    redirectUrl: process.env.MOMO_REDIRECT_URL,
    storeId: process.env.MOMO_STORE_ID,
  },

  zalo: {
    appId: process.env.ZALO_APP_ID,
    key1: process.env.ZALO_KEY1,
    key2: process.env.ZALO_KEY2,
    apiUrl: process.env.ZALO_API_URL,
    redirectUrl: process.env.ZALO_REDIRECT_URL,
    appUser: process.env.ZALO_APP_USER,
    callbackUrl: process.env.ZALO_CALLBACK_URL,
  },

  image: {
    folderName: 'grocery-mart',
    typeAllow: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    maxFileSize: (process.env.MAX_FILE_SIZE_IMAGE_MB || 3) * 1024 * 1024,
  },

  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },
};

module.exports = env;
