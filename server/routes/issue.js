const express = require('express');

const issueController = require('../controllers/issue');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/issue/:issueId', issueController.getIssues);

router.post('/issue/create', issueController.createIssue);

router.post('/issue/assignToUser', issueController.assignIssueToUser);

module.exports = router;