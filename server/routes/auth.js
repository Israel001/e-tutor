const express = require('express');
const { body } = require('express-validator/check');

const authController = require('../controllers/auth');

const middlewareIsAuth = require('../middleware/is-auth');

const User = require('../models/user');

const router = express.Router();

router.post(
    '/create_user',
    [
        body('email').isEmail().withMessage('Please enter a valid email').custom(userEmail => {
            return User.findOne({email: userEmail}).then(user => {
                if (user) return Promise.reject('E-mail already exists!');
            });
        }).normalizeEmail(),
        body('password').trim().isLength({min: 6}).withMessage('Password length must be at least 6 characters')
    ],
    middlewareIsAuth.isAuth,
    authController.createUser
);

router.post('/login', authController.login);

router.post('/reset_password', authController.resetPassword);

router.post('/new_password/:token', authController.newPassword);

module.exports = router;