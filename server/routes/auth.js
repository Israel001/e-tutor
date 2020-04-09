const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.post('/login', authController.login);

router.post('/reset_password', authController.resetPassword);

router.post('/new_password/:token', authController.newPassword);

module.exports = router;
