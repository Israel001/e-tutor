const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendGridTransport({
  auth: { api_key: `${process.env.NODEMAILER_KEY}` }
}));

module.exports = transporter;
