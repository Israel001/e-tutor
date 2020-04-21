const express = require('express');

const groupController = require('../controllers/group');

const isAuth = require('../middleware/is-auth').isAuth;

const router = express.Router();

router.post('/group/create', isAuth, groupController.createGroup);

router.get('/group/:groupId/info', isAuth, groupController.getGroupInfo);

router.get('/all_groups', isAuth, groupController.getGroups);

router.get('/group_messages', isAuth, groupController.getGroupMessages);

router.get('/groups', isAuth, groupController.getUserGroups);

router.put('/group/:groupId/add/:userId', isAuth, groupController.addUserToGroup);

router.put(
  '/group/:groupId/remove/:userId',
  isAuth,
  groupController.removeUserFromGroup
);

router.put('/group/:groupId/update', isAuth, groupController.updateGroup);

router.delete('/group/:groupId/delete', isAuth, groupController.deleteGroup);

module.exports = router;
