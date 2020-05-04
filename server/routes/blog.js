const express = require('express');

const blogController = require('../controllers/blog');

const isAuth = require('../middleware/is-auth').isAuth;

const router = express.Router();

router.post('/post/create', isAuth, blogController.createPost);

router.post('/post/:postId/like', isAuth, blogController.likePost);

router.post('/post/:postId/dislike', isAuth, blogController.disLikePost);

router.get('/posts', isAuth, blogController.getPosts);

router.get('/user/:userId/posts', isAuth, blogController.getUserPosts);

router.get('/post/:postId', isAuth, blogController.getPost);

router.get('/search/posts', isAuth, blogController.searchPosts);

router.put('/post/:postId/update', isAuth, blogController.updatePost);

router.delete('/post/:postId/delete', isAuth, blogController.deletePost);

module.exports = router;
