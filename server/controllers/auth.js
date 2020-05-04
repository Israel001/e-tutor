const crypto = require('crypto');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

const agenda = require('../agenda');
const User = require('../models/user');
const OAuth2Data = require('../google_key');

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = process.env.PORT ? OAuth2Data.web.redirect_uris[1] : OAuth2Data.web.redirect_uris[0];

const OAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

module.exports = {
  login: async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
      const user = await User.findOne({email: email});
      if (!user) {
        const error = new Error('Could not find a user with that email');
        error.statusCode = 401;
        error.message = 'Could not find a user with that email';
        // noinspection ExceptionCaughtLocallyJS
        res.status(401).json({
          message: 'Could not find a user with that email',
          data: { error }
        });
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const error = new Error('Passwords do not match');
        error.message = 'Passwords do not match';
        error.statusCode = 401;
        // noinspection ExceptionCaughtLocallyJS
        res.status(401).json({
          message: 'Passwords do not match',
          data: { error }
        });
      } else {
        if (!user.active) {
          const error = new Error('This account has not been activated yet');
          res.status(405).json({
            message: error.message,
            data: { error }
          });
        } else {
          const token = jwt.sign({
            userId: user._id.toString(),
            userRole: user.role
          }, `${process.env.JWT_PASSWORD}`, {expiresIn: '1h'});
          res.status(200).json({
            message: 'User Logged In Successfully!',
            data: {
              token: token,
              userId: user._id.toString(),
              userRole: user.role,
              userName: user.name,
              userPhoto: user.image
            }
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  signInWithGoogle: (req, res) => {
    const url = OAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/userinfo.email'
    });
    res.status(200).json({ url });
  },

  processGoogleAuth: (req, res, next) => {
    try {
      const code = req.body.code;
      if (code) {
        OAuth2Client.getToken(code, async (err, tokens) => {
          const userInfo = await OAuth2Client.getTokenInfo(tokens.access_token);
          const email = userInfo.email;
          const user = await User.findOne({ email });
          if (!user) {
            const error = new Error('Could not find a user with that email');
            error.statusCode = 401;
            error.message = 'Could not find a user with that email';
            // noinspection ExceptionCaughtLocallyJS
            res.status(401).json({
              message: 'Could not find a user with that email',
              data: { error }
            });
          } else {
            if (!user.active) {
              const error = new Error('This account has not been activated yet');
              res.status(405).json({
                message: error.message,
                data: { error }
              });
            } else {
              const token = jwt.sign({
                userId: user._id.toString(),
                userRole: user.role
              }, `${process.env.JWT_PASSWORD}`, {expiresIn: '1h'});
              res.status(200).json({
                message: 'User Logged In Successfully!',
                data: {
                  token: token,
                  userId: user._id.toString(),
                  userRole: user.role,
                  userName: user.name,
                  userPhoto: user.image
                }
              });
            }
          }
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  resetPassword: async (req, res, next) => {
    const email = req.body.email;
    const url = req.body.url;
    try {
      crypto.randomBytes(32, async (err, buffer) => {
        if (err) throw err;
        const user = await User.findOne({email: email});
        if (!user) {
          const error = new Error('Could not find user with that email');
          error.statusCode = 401;
          res.status(401).json({
            message: 'Could not find user with that email',
            data: { error }
          });
        }
        const token = buffer.toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        await agenda.now('reset password email', { email, url, token });
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
        res.status(422).json({
          message: 'Invalid token',
          data: {error}
        });
      } else {
        const isEqual = await bcrypt.compare(password, user.password);
        if (isEqual) {
          const error = new Error('You cannot re-use your former password');
          error.statusCode = 422;
          res.status(422).json({
            message: 'You cannot re-use your former password',
            data: {error}
          });
        } else {
          user.password = await bcrypt.hash(password, 12);
          user.resetToken = '';
          await user.save();
          res.status(201).json({
            message: 'Password resetted successfully!'
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};
