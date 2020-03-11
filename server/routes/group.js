const express = require('express');

const groupController = require('../controllers/group');

const router = express.Router();

router.post('/group/create', groupController.createGroup);

router.get('/groups', groupController.getUserGroups);

router.put('/group/:groupId/add/:userId', groupController.addUserToGroup);

router.put('/group/:groupId/remove/:userId', groupController.removeUserFromGroup);

router.put('/group/:groupId/update', groupController.updateGroup);

router.delete('/group/:groupId/delete', groupController.deleteGroup);

module.exports = router;