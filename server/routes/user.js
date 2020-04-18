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

router.get('/search_users', userController.searchUsers);

router.get('/issue/getListOfIssues', userController.getListOfIssues);

router.post('/assignUser', isAuth , userController.assignUser);

router.post('/removeStdAndTutor', isAuth, userController.removeUserFromTutor);

module.exports = router;