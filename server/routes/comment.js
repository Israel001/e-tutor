const express = require('express');

const commentController = require('../controllers/comment');

const isAuth = require('../middleware/is-auth').isAuth;

const router = express.Router();

router.post('/addComment', isAuth, commentController.addComment);

router.post('/blog/comment', isAuth, commentController.addCommentToBlog);

router.delete('/issue/:issueId/comment/:commentId/delete', isAuth, commentController.deleteComment);

router.delete('/post/:postId/comment/:commentId/delete', isAuth, commentController.deletePostComment);

router.put('/issue/:issueId/comment/:commentId/edit', isAuth, commentController.editComment);

router.put('/post/:postId/comment/:commentId/edit', isAuth, commentController.editPostComment);

router.get('/issue/:issueId/comments', isAuth, commentController.getIssueComments);

router.get('/post/:postId/comments', isAuth, commentController.getPostComments);

router.get('/comments', isAuth, commentController.getComments);

module.exports = router;

