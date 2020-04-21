const express = require('express');

const issueController = require('../controllers/issue');

const isAuth = require('../middleware/is-auth').isAuth;

const router = express.Router();

router.get('/issues', isAuth, issueController.getIssues);

router.get('/user/:userId/issues', isAuth, issueController.getUserIssues);

router.get('/issue/:issueId', isAuth, issueController.getIssue);

router.post('/issue/create', isAuth, issueController.createIssue);

router.put(
  '/issue/:issueId/assignToUser',
  isAuth,
  issueController.assignIssueToUser
);

module.exports = router;
