const crypto = require('crypto');

const moment = require('moment');
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;
const agenda = require('../agenda');
const Meeting = require('../models/meeting');
const User = require('../models/user');

module.exports = {
  createMeeting: async (req, res, next) => {
    try {
      const url = req.body.url;
      const organizer = req.userId;
      const title = req.body.title;
      const description = req.body.description;
      const date = req.body.date;
      const members = req.body.members.split(',');
      const membersInfo = [];
      for (let i = 0; i < members.length; i++) {
        const user = await User.findById(members[i]);
        if (!user) {
          const error = new Error('One of the members does not exist!');
          res.status(404).json({
            message: error.message,
            data: { error  }
          });
        } else { membersInfo.push(user); }
      }
      const meeting = new Meeting({
        organizer,
        title,
        description,
        date,
        members,
        status: 'request'
      });
      const createdMeeting = await meeting.save();
      crypto.randomBytes(32, async (err, buffer) => {
        if (err) throw err;
        const token = buffer.toString('hex');
        meeting.acceptToken = token;
        meeting.acceptTokenExpiration = date;
        await meeting.save();
        for (let i = 0; i < membersInfo.length; i++) {
          await agenda.now('meeting invitation email', {
            email: membersInfo[i].email,
            url,
            token,
            title,
            date: moment(date).format('MMMM Do YYYY, h:mm:ss a'),
            organizer: membersInfo[i].name
          });
          meeting.requestPending += 1;
          await meeting.save();
        }
        res.status(201).json({
          message: 'Meeting Created Successfully!',
          data: { meetingId: createdMeeting._id.toString() }
        });
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getMeeting: async (req, res, next) =>  {
    try {
      const token = req.query.token;
      const meeting = await Meeting
        .findOne({ acceptToken: token })
        .populate('organizer').populate('members');
      if (!meeting) {
        const error = new Error('Meeting Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (!(meeting.acceptTokenExpiration > Date.now())) {
          const error = new Error('This meeting is in the past');
          res.status(400).json({
            message: error.message,
            data: { error }
          });
        } else {
          res.status(200).json({
            message: 'Meeting Retrieved Successfully!',
            data: {meeting}
          });
        }
      }
    } catch (err) {
      if (!err) err.statusCode = 500;
      next(err);
    }
  },

  acceptMeetingAndCreateSchedule: async (req, res, next) => {
    const token = req.params.token;
    try {
      const meeting = await Meeting.findOne({ acceptToken: token, acceptTokenExpiration: { $gt: Date.now() }});
      if (!meeting) {
        const error = new Error('Invalid token');
        res.status(400).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (meeting.accepts.includes(ObjectId(req.userId))) {
          const error = new Error('You accepted this meeting already');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else if (meeting.rejects.includes(ObjectId(req.userId))) {
          const error = new Error('You rejected this meeting already');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else {
          meeting.accepts.push(req.userId);
          meeting.requestPending -= 1;
          if (meeting.accepts.length > 0) meeting.status = 'accepted';
          const user = await User.findById(req.userId);
          const job = await agenda.schedule(
            moment(meeting.date).fromNow(), 'meeting reminder email', {
              email: user.email,
              name: user.name,
              title: meeting.title
            });
          user.meetings = `${meeting._id.toString()}-${job.attrs._id.toString()}`;
          await user.save();
          const organizer = await User.findById(meeting.organizer);
          await agenda.now('meeting accepted email', {
            email: organizer.email,
            title: meeting.title,
            name: organizer.name,
            acceptedBy: user.name
          });
          const organizerJob = await agenda.schedule(moment(meeting.date).fromNow(), 'meeting reminder email', {
            email: organizer.email,
            name: organizer.name,
            title: meeting.title
          });
          organizer.meetings = `${meeting._id.toString()}-${organizerJob.attrs._id.toString()}`;
          await organizer.save();
          await meeting.save();
          res.status(200).json({message: 'Meeting Accepted Successfully!'});
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  rejectMeeting: async (req, res, next) => {
    try {
      const token = req.params.token;
      const meeting = await Meeting.findOne({ acceptToken: token, acceptTokenExpiration: { $gt: Date.now() }});
      if (!meeting) {
        const error = new Error('Invalid token');
        res.status(400).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (meeting.accepts.includes(ObjectId(req.userId))) {
          const error = new Error('You accepted this meeting already');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else if (meeting.rejects.includes(ObjectId(req.userId))) {
          const error = new Error('You rejected this meeting already');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else {
          meeting.rejects.push(req.userId);
          meeting.requestPending -= 1;
          if (meeting.accepts.length <= 0) meeting.status = 'rejected';
          const user = await User.findById(meeting.organizer);
          const otherUser = await User.findById(req.userId);
          await agenda.now('meeting rejected email', {
            email: user.email,
            title: meeting.title,
            name: user.name,
            rejectedBy: otherUser.name
          });
          await meeting.save();
          res.status(200).json({message: 'Meeting Rejected Successfully!'});
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  postponeMeeting: async (req, res, next) => {
    try {
      const meetingId = req.params.meetingId;
      const date = req.body.date;
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        const error = new Error('Meeting Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (meeting.organizer.toString() !== req.userId) {
          const error = new Error('Not Authorized!');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else {
          meeting.date = date;
          meeting.status = 'postponed';
          for (let i = 0; i < meeting.members.length; i++) {
            const user = await User.findById(meeting.members[i]);
            user.meetings = user.meetings.filter(el => el.split('-')[0] === meeting._id.toString());
            await agenda.cancel({_id: ObjectId(user.meetings[0].split('-')[1])});
            await agenda.now('meeting postponed email', {
              email: user.email,
              name: user.name,
              title: meeting.title,
              date: moment(date).format('MMMM Do YYYY, h:mm:ss a')
            });
            await agenda.schedule(moment(date).fromNow(), 'meeting reminder email', {
              email: user.email,
              name: user.name,
              title: meeting.title
            });
          }
          const organizer = await User.findById(req.userId);
          organizer.meetings = organizer.meetings.filter(el => el.split('-')[0] === meeting._id.toString());
          await agenda.cancel({_id: ObjectId(organizer.meetings[0].split('-')[1])});
          await agenda.schedule(moment(date).fromNow(), 'meeting reminder email', {
            email: organizer.email,
            name: organizer.name,
            title: meeting.title
          });
          await meeting.save();
          res.status(201).json({
            message: 'Meeting Postponed Successfully!',
            data: {meetingId: meeting._id.toString()}
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  cancelMeeting: async (req, res, next) => {
    try {
      const meetingId = req.params.meetingId;
      const reason = req.body.reason;
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        const error = new Error('Meeting Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        const organizer = await User.findById(meeting.organizer);
        if (req.userId.toString() !== organizer._id.toString()) {
          const error = new Error('Not Authorized!');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else {
          if (meeting.status === 'request') {
            const error = new Error('You cannot cancel a meeting that has not been accepted by its members');
            res.status(422).json({
              message: error.message,
              data: { error }
            });
          } else {
            for (let i = 0; i < meeting.members.length; i++) {
              const user = await User.findById(meeting.members[i]);
              user.meetings = user.meetings.filter(el => el.split('-')[0] === meeting._id.toString());
              await agenda.cancel({_id: ObjectId(user.meetings[0].split('-')[1])});
              await agenda.now('meeting canceled email', {
                email: user.email,
                reason,
                name: user.name,
                title: meeting.title,
                canceledBy: organizer.name
              });
            }
            const organizer = await User.findById(req.userId);
            organizer.meetings = organizer.meetings.filter(el => el.split('-')[0] === meeting._id.toString());
            await agenda.cancel({_id: ObjectId(organizer.meetings[0].split('-')[1])});
            await Meeting.findByIdAndRemove(meetingId, {useFindAndModify: false});
          }
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};
