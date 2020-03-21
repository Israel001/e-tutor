const express = require('express');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth').isAuth;

const router = express.Router();

router.get('/get_tutors', userController.getTutors);

router.get(
  '/get/:userId/tutors_students',
  isAuth,
  userController.getUserTutorsAndStudents
);

router.get('/get_conversations', isAuth, userController.getConversations);

module.exports = router;