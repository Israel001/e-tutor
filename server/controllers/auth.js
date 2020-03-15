const crypto = require('crypto');

const { validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
      api_key: `${process.env.NODEMAILER_KEY}`
    }
}));

const User = require('../models/user');

module.exports = {
    createUser: async (req, res, next) => {
        try {
            if (req.role !== 'admin') {
                const error = new Error('Not Authorized!');
                error.statusCode = 403;
                // noinspection ExceptionCaughtLocallyJS
                throw error;
            }
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorData = errors.array();
                const error = new Error(errorData[0].msg);
                error.statusCode = 422;
                error.data = errorData;
                // noinspection ExceptionCaughtLocallyJS
                throw error;
            }
            const email = req.body.email;
            const password = req.body.password;
            const role = req.body.role;
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({
                email: email, 
                password: hashedPassword,
                role: role
            });
            const createdUser = await user.save();
            res.status(201).json({
                message: 'User Created Successfully!',
                data: { userId: createdUser._id.toString(), userEmail: createdUser.email }
            });
        } catch (err) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        }
    },

    login: async (req, res, next) => {
        const email = req.body.email;
        const password = req.body.password;
        try {
            const user = await User.findOne({email: email});
            if (!user) {
                const error = new Error('Could not find a user with that email');
                error.statusCode = 401;
                // noinspection ExceptionCaughtLocallyJS
                throw error;
            }
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                const error = new Error('Passwords do not match');
                error.statusCode = 401;
                // noinspection ExceptionCaughtLocallyJS
                throw error;
            }
            const token = jwt.sign({
                userId: user._id.toString(),
                userRole: user.role
            }, `${process.env.JWT_PASSWORD}`, {expiresIn: '1h'});
            res.status(200).json({
                message: 'User Logged In Successfully!',
                data: { token: token  }
            });
        } catch (err) { 
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        }
    },

    resetPassword: async (req, res, next) => {
        const email = req.body.email;
        const url = req.body.url;
        try {
            const user = await User.findOne({email: email});
            if (!user) {
                const error = new Error('Could not find user with that email');
                error.statusCode = 401;
                // noinspection ExceptionCaughtLocallyJS
                throw error;
            }
            crypto.randomBytes(32, async (err, buffer) => {
                if (err) throw err;
                const token = buffer.toString('hex');
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                await user.save();
                transporter.sendMail({
                    to: email,
                    from: 'admin@e-tutor.com',
                    subject: 'Password Reset',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this 
                        <a href="${url}/new_password/${token}">
                        link</a> to set a new password.</p>
                    `
                });
                res.status(200).json({
                    message: 'Please check your email to reset the password'
                });
            });            
        } catch (err) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        } 
    },

    newPassword: async (req, res, next) => {
        const password = req.body.password;
        const token = req.params.token;
        try {
            const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
            if (!user) {
                const error = new Error('Invalid token');
                error.statusCode = 422;
                // noinspection ExceptionCaughtLocallyJS
                throw error;
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            user.password = hashedPassword;
            user.resetToken = '';
            await user.save();
            res.status(201).json({
                message: 'Password resetted successfully!'
            });
        } catch (err) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        }
    }
};