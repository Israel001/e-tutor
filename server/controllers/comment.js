const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;

const Issue = require('../models/issue');
const Comment = require('../models/comment');
const Activity = require('../models/activity');
const Blog = require('../models/blog');

module.exports = {
  addComment: async (req, res, next) => {
    const fromUser = req.userId;
    const content = req.body.comment;
    const issueId = req.body.issueId;
    try {
      // Create and Store a Comment Schema Object
      const comment = new Comment({
        from: fromUser,
        comment: content,
        issue: issueId
      });
      const createdComment = await comment.save();
      const activity = new Activity({
        activity: 'commentIssue',
        owner: req.userId,
        issue: issueId
      });
      await activity.save();
      // Return a successful response
      res.status(201).json({
        message: 'Comment Created successfully!',
        data: { createdComment }
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  addCommentToBlog: async (req, res, next) => {
    const fromUser = req.userId;
    const content = req.body.comment;
    const postId = req.body.postId;
    try {
      // Create and Store a Comment Schema Object
      const comment = new Comment({
        from: fromUser,
        comment: content,
        post: postId
      });
      const createdComment = await comment.save();
      const activity = new Activity({
        activity: 'commentPost',
        owner: req.userId,
        post: postId
      });
      await activity.save();
      // Return a successful response
      res.status(201).json({
        message: 'Comment Created successfully!',
        data: { createdComment }
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getIssueComments: async (req, res, next) => {
    try {
      const issueId = req.params.issueId;
      const issue = await Issue.findById(issueId);
      if (issue.creator !== req.userId && !issue.assignTo.includes(req.userId) && req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        const comments = await Comment.find({
          issue: ObjectID(issueId)
        }).populate('from');
        res.status(200).json({
          message: 'Issue Comments Retrieved Successfully!',
          comments
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getPostComments: async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const comments = await Comment.find({
        post: ObjectID(postId)
      }).populate('from');
      res.status(200).json({
        message: 'Post Comments Retrieved Successfully!',
        comments
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getComments: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = req.query.perPage || 10;
      const totalItems = await Comment.find().countDocuments();
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        const comments = await Comment.find()
          .populate('from').populate('issue')
          .skip((currentPage - 1) * perPage).limit(perPage);
        res.status(200).json({
          message: 'Comments Retrieved Successfully!',
          data: comments, totalItems
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  deleteComment: async (req, res, next) => {
    const userId = req.userId;
    const issueId = req.params.issueId;
    const commentId = req.params.commentId;
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        const error = new Error('The issue does not exist');
        error.statusCode = 404;
        res.status(error.statusCode).json({
          message: 'Issue not found',
          data: { error }
        });
      }
      const comment = await Comment.findById(commentId);
      if (comment.from._id.toString() !== userId.toString() && req.role !== 'admin') {
        const error = new Error('Not authorized to Delete this comment');
        error.statusCode = 403;
        throw error;
      }
      await Comment.findByIdAndRemove(commentId);

      const activity = new Activity({
        activity: 'deleteIssueComment',
        owner: req.userId,
        issue: issue._id
      });
      await activity.save();
      res.status(200).json({message: 'Comment Deleted Successfully'});
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  deletePostComment: async (req, res, next) => {
    const userId = req.userId;
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    try {
      const post = await Blog.findById(postId);
      if (!post) {
        const error = new Error('The Post does not exist');
        error.statusCode = 404;
        res.status(error.statusCode).json({
          message: error.message,
          data: { error }
        });
      }
      const comment = await Comment.findById(commentId);
      if (comment.from._id.toString() !== userId.toString() && req.role !== 'admin') {
        const error = new Error('Not authorized to Delete this comment');
        error.statusCode = 403;
        throw error;
      }
      await Comment.findByIdAndRemove(commentId);

      const activity = new Activity({
        activity: 'deletePostComment',
        owner: req.userId,
        post: post._id
      });
      await activity.save();
      res.status(200).json({message: 'Comment Deleted Successfully'});
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  editComment: async (req, res, next) => {
    const userId = req.userId;
    const commentId = req.params.commentId;
    const issueId = req.params.issueId;
    const updatedContent = req.body.comment;
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        const error = new Error('Issue Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        const comment = await Comment.findById(commentId);
        if (comment.from._id.toString() !== userId.toString() && req.role !== 'admin') {
          const error = new Error('Not authorized to Edit this comment');
          error.statusCode = 403;
          throw error;
        }
        comment.comment = updatedContent;
        const updatedComment = await comment.save();
        const activity = new Activity({
          activity: 'editIssueComment',
          owner: req.userId,
          issue: issue._id
        });
        await activity.save();
        res.status(200).json({
          message: 'Updated Comment successfully',
          updatedComment
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  editPostComment: async (req, res, next) => {
    const userId = req.userId;
    const commentId = req.params.commentId;
    const postId = req.params.postId;
    const updatedContent = req.body.comment;
    try {
      const post = await Blog.findById(postId);
      if (!post) {
        const error = new Error('Post Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        const comment = await Comment.findById(commentId);
        if (comment.from._id.toString() !== userId.toString() && req.role !== 'admin') {
          const error = new Error('Not authorized to Edit this comment');
          error.statusCode = 403;
          throw error;
        }
        comment.comment = updatedContent;
        const updatedComment = await comment.save();
        const activity = new Activity({
          activity: 'editPostComment',
          owner: req.userId,
          post: post._id
        });
        await activity.save();
        res.status(200).json({
          message: 'Updated Comment successfully',
          updatedComment
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};
