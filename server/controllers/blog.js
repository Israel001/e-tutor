const Blog = require('../models/blog');
const User = require('../models/user');
const Activity = require('../models/activity');
const Comment = require('../models/comment');

module.exports = {
  createPost: async (req, res, next) => {
    try {
      const author = req.userId;
      const title = req.body.title;
      const photo = req.body.photo;
      const body = req.body.body;
      const category = req.body.category;
      const post = new Blog({title, author, photo, body, category});
      await post.save();
      const activity = new Activity({
        activity: 'createPost',
        owner: req.userId,
        post: post._id
      });
      await activity.save();
      res.status(201).json({
        message: 'Post Created Successfully!',
        data: post
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  likePost: async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const post = await Blog.findById(postId);
      if (!post) {
        const error = new Error('Post Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (post.dislikes.includes(req.userId)) {
          post.dislikesCount -= 1;
          post.dislikes = post.dislikes.filter(el => el.toString() !== req.userId);
        }
        if (!post.likes.includes(req.userId)) {
          post.likesCount += 1;
          post.likes.push(req.userId);
        } else {
          post.likesCount -= 1;
          post.likes = post.likes.filter(el => el.toString() !== req.userId)
        }
        await post.save();
        const activity = new Activity({
          activity: 'likePost',
          owner: req.userId,
          post: post._id
        });
        await activity.save();
        res.status(201).json({
          message: 'Liked Post Successfully!',
          data: post
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  disLikePost: async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const post = await Blog.findById(postId);
      if (!post) {
        const error = new Error('Post Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (post.likes.includes(req.userId)) {
          post.likesCount -= 1;
          post.likes = post.likes.filter(el => el.toString() !== req.userId);
        }
        if (!post.dislikes.includes(req.userId)) {
          post.dislikesCount += 1;
          post.dislikes.push(req.userId);
        } else {
          post.dislikesCount -= 1;
          post.dislikes = post.dislikes.filter(el => el.toString() !== req.userId);
        }
        const activity = new Activity({
          activity: 'dislikePost',
          owner: req.userId,
          post: post._id
        });
        await activity.save();
        await post.save();
        res.status(201).json({
          message: 'Liked Post Successfully!',
          data: post
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getPosts: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = req.query.perPage || 10;
      const posts = await Blog.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate('author')
        .sort({ likesCount: - 1 });
      res.status(200).json({
        message: 'Posts Retrieved Successfully!',
        data: posts
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getUserPosts: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        const error = new Error('User Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        const posts = await Blog.find({author: userId}).populate('author');
        res.status(200).json({
          message: 'User Posts Retrieved Successfully!',
          data: posts
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getPost: async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const post = await Blog.findById(postId).populate('author');
      if (!post) {
        const error = new Error('Post Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        res.status(200).json({
          message: 'Post Information Retrieved Successfully!',
          data: post
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  searchPosts: async(req, res, next) => {
    try {
      const searchQuery = req.query.searchQuery;
      const posts = await Blog.find({
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
          { content: { $regex: searchQuery, $options: 'i' } }
        ]
      }).populate('author');
      res.status(200).json({
        message: 'Posts Retrieved Successfully!',
        data: posts
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  updatePost: async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const title = req.body.title;
      const body = req.body.body;
      const photo = req.body.photo;
      const category = req.body.category;
      let post = await Blog.findById(postId);
      if (!post) {
        const error = new Error('Post Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (post.author !== req.userId && req.role !== 'admin') {
          const error = new Error('Not Authorized!');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else {
          post.title = title;
          post.body = body;
          post.photo = photo;
          post.category = category;
          await post.save();
          res.status(201).json({
            message: 'Post Updated Successfully!',
            data: post
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  deletePost: async(req, res, next) => {
    try {
      const postId = req.params.postId;
      const post = await Blog.findById(postId);
      if (!post) {
        const error = new Error('Post Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (post.author !== req.userId && req.role !== 'admin') {
          const error = new Error('Not Authorized!');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else {
          await Comment.deleteMany({ post: post._id });
          await Blog.findByIdAndRemove(post, { useFindAndModify: false });
          res.status(200).json({message: 'Post Deleted Successfully!'});
        }
      }
    } catch (err) {
      if (!err.statusCOde) err.statusCode = 500;
      next(err);
    }
  }
};
