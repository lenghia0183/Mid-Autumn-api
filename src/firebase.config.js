require('dotenv').config();
const admin = require('firebase-admin');
const { logger, env } = require('./config');

try {
  const serviceAccount = {
    projectId: env.firebase.projectId,
    clientEmail: env.firebase.clientEmail,
    privateKey: env.firebase.privateKey,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  logger.info('Firebase Admin SDK initialized successfully');
} catch (error) {
  logger.error('Error initializing Firebase Admin SDK:', error);
}

module.exports = {
  admin,
};
