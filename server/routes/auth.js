const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.post('/login', authController.login);

router.post('/reset_password', authController.resetPassword);

router.post('/new_password/:token', authController.newPassword);

router.get('/login/google', authController.signInWithGoogle);

router.post('/verify_google_auth', authController.processGoogleAuth);

module.exports = router;
