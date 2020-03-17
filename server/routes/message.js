const express = require('express');

const messageController = require('../controllers/message');

const isAuth = require('../middleware/is-auth').isAuth;

const router = express.Router();

router.post('/message', isAuth, messageController.sendMessage);

router.get('/messages', isAuth, messageController.getMessages);

router.put('/message/:messageId/update', isAuth, messageController.updateMessage);

router.delete('/message/:messageId/delete', isAuth, messageController.deleteMessage);

module.exports = router;