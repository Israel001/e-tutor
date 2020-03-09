const express = require('express');

const messageController = require('../controllers/message');

const router = express.Router();

router.post('/message', messageController.sendMessage);

router.get('/messages', messageController.getMessages);

router.put('/message/:messageId/update', messageController.updateMessage);

router.delete('/message/:messageId/delete', messageController.deleteMessage);

module.exports = router;