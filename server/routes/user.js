const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth').isAuth;

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
  isAuth,
  userController.createUser
);

router.get('/get_active_tutors', userController.getActiveTutors);

router.get('/get_tutors', userController.getTutors);

router.get(
  '/get/:userId/tutors_students',
  isAuth,
  userController.getUserTutorsAndStudents
);

router.get('/get_conversations', isAuth, userController.getConversations);

router.get('/search_users', userController.searchUsers);

router.get('/get_user_info', userController.getUserInfo);

router.get('/get_all_users', userController.getAllUsers);

router.get('/get_all_students', userController.getAllStudents);

router.get('/get_all_admins', userController.getAllAdmins);

router.get('/get_all_allocated_students', userController.getAllAllocatedStudents);

router.get('/get_all_unallocated_students', userController.getAllUnallocatedStudents);

router.get('/get_all_allocated_tutors', userController.getAllAllocatedTutors);

router.get('/get_all_unallocated_tutors', userController.getAllUnallocatedTutors);

router.get('/get_all_active_users', userController.getAllActiveUsers);

router.get('/get_all_inactive_users', userController.getAllInactiveUsers);

router.post('/assignUser', isAuth, userController.assignUser);

router.post('/removeStdAndTutor', isAuth, userController.removeUserFromTutor);

router.put('/deactivate/user/:userId', isAuth, userController.deactivateUser);

router.put('/activate/user/:userId', isAuth, userController.activateUser);

router.put('/update/user/:userId', isAuth, userController.updateUser);

router.delete('/delete/user/:userId', isAuth, userController.deleteUser);

module.exports = router;
