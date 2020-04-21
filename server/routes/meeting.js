const express = require('express');

const meetingController = require('../controllers/meeting');
const isAuth = require('../middleware/is-auth').isAuth;

const router = express.Router();

router.post('/create_meeting', isAuth, meetingController.createMeeting);

router.get('/user/:userId/meetings', isAuth, meetingController.getUserMeetings);

router.get('/meetings', isAuth, meetingController.getMeetings);

router.get('/get_meeting', meetingController.getMeeting);

router.get(
  '/accept_meeting/:token',
  isAuth,
  meetingController.acceptMeetingAndCreateSchedule
);

router.get('/reject_meeting/:token', isAuth, meetingController.rejectMeeting);

router.put('/postpone_meeting/:meetingId', isAuth, meetingController.postponeMeeting);

router.delete('/cancel_meeting/:meetingId', isAuth, meetingController.cancelMeeting);

module.exports = router;
