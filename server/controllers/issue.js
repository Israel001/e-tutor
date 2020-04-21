const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;

const User = require('../models/user');
const Issue = require('../models/issue');

module.exports = {
  getIssues: async (req, res, next) => {
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        const issues = await Issue
          .find()
          .populate('creator')
          .populate('assignTo')
          .sort({ createdAt: -1 });
        res.status(200).json({
          message: 'Issues Retrieved Successfully!',
          data: issues
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getUserIssues: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      if (userId !== req.userId && req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        const issues = await Issue.find({
          $or: [
            { creator: userId },
            { assignTo: { $in: userId } }
          ]
        }).sort({ createdAt: -1 });
        res.status(200).json({
          message: 'User Issues Retrieved Successfully!',
          data: { issues }
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getIssue: async (req, res, next) => {
    const issueId = req.params.issueId;
    try {
      const issue = await Issue.findById(issueId);
      if (issue.creator !== req.userId && !issue.assignTo.includes(req.userId) && req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (!issue) {
          const error = new Error('The issue does not exist');
          error.statusCode = 404;
          res.status(error.statusCode).json({
            message: 'Issue not found',
            data: {error}
          });
        } else {
          res.status(200).json({
            message: 'Issue Fetched Successfully!',
            data: {issue}
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  createIssue: async (req, res, next) => {
    const creator = req.userId;
    const title = req.body.title;
    const description = req.body.description;
    const assignTo = req.body.toUserId.split(',');
    if (assignTo.includes(req.userId)) {
      const error = new Error('You cannot assign an issue to yourself');
      res.status(403).json({
        message: error.message,
        data: { error }
      });
    } else {
      const issue = new Issue({
        title,
        description,
        creator,
        assignTo,
        arrayOfComments: []
      });
      try {
        await issue.save();
        res.status(201).json({
          message: 'Issue created successfully!',
          data: {issue}
        });
      } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
      }
    }
  },

  assignIssueToUser: async (req, res, next) => {
    const issueId = req.params.issueId;
    const assignToUserId = req.body.userId.split(',');
    if (assignToUserId.includes(req.userId)) {
      const error = new Error('You cannot assign an issue to yourself');
      res.status(403).json({
        message: error.message,
        data: { error }
      });
    } else {
      try {
        const issue = await Issue.findById(issueId);
        const toUser = await User.findById(assignToUserId);
        let isError = false;
        for (let i = 0; i < assignToUserId.length; i++) {
          if (issue.assignTo.includes(assignToUserId[i])) {
            isError = true;
            const error = new Error('This issue has been assigned to this user already');
            res.status(403).json({
              message: error.message,
              data: { error }
            });
          }
        }
        if (!isError) {
          if (issue.creator !== req.userId && !issue.assignTo.includes(req.userId) && req.role !== 'admin') {
            const error = new Error('Not Authorized!');
            res.status(403).json({
              message: error.message,
              data: {error}
            });
          } else {
            if (!issue) {
              const error = new Error('The issue does not exist');
              error.statusCode = 404;
              res.status(error.statusCode).json({
                message: 'Issue not found',
                data: {error}
              });
            } else if (!toUser) {
              const error = new Error('User does not exist');
              error.statusCode = 404;
              res.status(error.statusCode).json({
                message: 'User not found',
                data: {error}
              });
            } else {
              issue.assignTo.push(toUser._id);
              const updatedIssue = await issue.save();
              res.status(201).json({
                message: 'Assign to User successfully',
                data: {updatedIssue}
              });
            }
          }
        }
      } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
      }
    }
  }
};

