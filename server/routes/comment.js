const express = require('express');

const commentController = require('../controllers/comment');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/addComment', commentController.addComment);

router.post('/deleteComment', commentController.deleteComment);

router.post('/editComment', commentController.editComment);

module.exports = router;

