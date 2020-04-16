const mongoose = require('mongoose');

const transporter = require('../nodemailer');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}-puhqm.gcp.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const checkCancelled = async job => {
  const db = await mongoose.connect(MONGODB_URI);
  const count = await db.collection('agendaJobs').count({ _id: job.attrs.data._id });
  return !(count > 0);
};

module.exports = agenda => {
  agenda.define('reset password email', async job => {
    const email = job.attrs.data.email;
    const url = job.attrs.data.url;
    const token = job.attrs.data.token;
    transporter.sendMail({
      to: email,
      from: 'admin@e-tutor.com',
      subject: 'Password Reset',
      html: `
          <p>You requested a password reset</p>
          <p>Click this 
          <a href="${url}/change-password.html?token=${token}">
          link</a> to set a new password.</p>
      `
    });
  });

  agenda.define('meeting invitation email', async job => {
    const email = job.attrs.data.email;
    const url = job.attrs.data.url;
    const token = job.attrs.data.token;
    const organizer = job.attrs.data.organizer;
    const date = job.attrs.data.date;
    const title = job.attrs.data.title;
    transporter.sendMail({
      to: email,
      from: 'admin@e-tutor.com',
      subject: 'Meeting Invitation',
      html: `
        <p>You have been invited to join a meeting</p>
        <p>Organizer: ${organizer}</p>
        <p>Date: ${date}</p>
        <p>Title: ${title}</p>
        <p>Click this <a href="${url}/accept-meeting.html?token=${token}">link</a> to accept or reject the meeting</p>
      `
    });
  });

  agenda.define('meeting accepted email', async job => {
    const email = job.attrs.data.email;
    const title = job.attrs.data.title;
    const name = job.attrs.data.name;
    const acceptedBy = job.attrs.data.acceptedBy;
    transporter.sendMail({
      to: email,
      from: 'admin@e-tutor.com',
      subject: 'Meeting Accepted',
      html: `
        <p>Hello ${name}</p>
        <p>Your Meeting "${title}" was accepted by ${acceptedBy}</p>
      `
    });
  });

  agenda.define('meeting rejected email', async job => {
    const email = job.attrs.data.email;
    const title = job.attrs.data.title;
    const name = job.attrs.data.name;
    const rejectedBy = job.attrs.data.rejectedBy;
    transporter.sendMail({
      to: email,
      from: 'admin@e-tutor.com',
      subject: 'Meeting Rejected',
      html: `
        <p>Hello ${name}</p>
        <p>Your Meeting "${title}" was rejected by ${rejectedBy}</p>
      `
    });
  });

  agenda.define('meeting reminder email', async job => {
    if (await checkCancelled(job)) return;
    const email = job.attrs.data.email;
    const name = job.attrs.data.name;
    const title = job.attrs.data.title;
    transporter.sendMail({
      to: email,
      from: 'admin@e-tutor.com',
      subject: 'Meeting Reminder',
      html: `
        <p>Hello ${name}</p>
        <p>Your Meeting "${title}" starts now</p>
      `
    });
  });

  agenda.define('meeting postponed email', async job => {
    const email = job.attrs.data.email;
    const name = job.attrs.data.name;
    const title = job.attrs.data.title;
    const date = job.attrs.data.date;
    transporter.sendMail({
      to: email,
      from: 'admin@e-tutor.com',
      subject: 'Meeting Postponed',
      html: `
        <p>Hello ${name}</p>
        <p>Your Meeting "${title}" has been postponed to ${date}</p>
      `
    });
  });

  agenda.define('meeting canceled email', async job => {
    const email = job.attrs.data.email;
    const title = job.attrs.data.title;
    const reason = job.attrs.data.reason;
    const name = job.attrs.data.name;
    const canceledBy = job.attrs.data.canceledBy;
    transporter.sendMail({
      to: email,
      from: 'admin@e-tutor.com',
      subject: 'Meeting Canceled',
      html: `
        <p>Hello ${name}</p>
        <p>Your Meeting "${title}" has been canceled by ${canceledBy} for the following reason:</p>
        <p>${reason}</p>
      `
    });
  });
};
