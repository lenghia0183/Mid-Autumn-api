const express = require('express');
const { chatController } = require('../../controllers');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/me', chatController.getUserChat);

router.post('/message', chatController.sendMessage);

router.patch('/:chatId/read-all', chatController.markAllAsRead);

router.get('/admin', authorize(['admin']), chatController.getAdminChats);
router.get('/:chatId', authorize(['admin']), chatController.getChatById);
router.patch('/message/status', authorize(['admin']), chatController.updateMessageStatus);

module.exports = router;
