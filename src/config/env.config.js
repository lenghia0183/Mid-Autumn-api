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
    secretAccess: process.env.JWT_SECRET_ACCESS || 'secret-access',
    expiresAccessToken: process.env.JWT_EXPIRES_ACCESS_MINUTES + 'm' || '100m',
    secretRefresh: process.env.JWT_SECRET_REFRESH || 'secret-refresh',
    expiresRefreshToken: process.env.JWT_EXPIRES_REFRESH_MINUTES + 'm' || '1000m',
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
};

module.exports = env;
