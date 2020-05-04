const User = require('../models/user');
const Issue = require('../models/issue');
const Activity = require('../models/activity');
const Comment = require('../models/comment');

module.exports = {
  getIssues: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = req.query.perPage || 10;
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        const issues = await Issue
          .find()
          .skip((currentPage - 1) * perPage)
          .limit(perPage)
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
      const currentPage = req.query.page || 1;
      const perPage = parseInt(req.query.perPage) || 3;
      const pagination = req.query.pagination || 'true';
      const userId = req.params.userId;
      const totalItems = await Issue.find({
        $or: [
          { creator: userId },
          { assignTo: { $in: userId } }
        ]
      }).countDocuments();
      if (userId !== req.userId && req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        let issues;
        if (pagination === 'true') {
          issues = await Issue.find({
            $or: [
              {creator: userId},
              {assignTo: {$in: userId}}
            ]
          }).skip((currentPage - 1) * perPage)
            .limit(perPage)
            .sort({createdAt: -1}).populate('assignTo').populate('creator');
        } else {
          issues = await Issue.find({
            $or: [
              {creator: userId},
              {assignTo: {$in: userId}}
            ]
          }).sort({createdAt: -1}).populate('assignTo').populate('creator');
        }
        res.status(200).json({
          message: 'User Issues Retrieved Successfully!',
          issues, totalItems
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
      let issue = await Issue.findById(issueId);
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
          issue = await Issue.findById(issueId).populate('creator').populate('assignTo');
          res.status(200).json({
            message: 'Issue Fetched Successfully!',
            data: issue
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
    const files = req.body.files;
    const assignTo = req.body.toUserId;
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
        files
      });
      try {
        await issue.save();
        const activity = new Activity({
          activity: 'createIssue',
          owner: req.userId,
          issue: issue._id
        });
        await activity.save();
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

  updateIssue: async (req, res, next) => {
    try {
      const issueId = req.params.issueId;
      const title = req.body.title;
      const description = req.body.description;
      const files = req.body.files || [];
      const assignTo = req.body.assignTo;
      const issue = await Issue.findById(issueId);
      if (!issue) {
        const error = new Error('Issue Not Found');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (req.userId !== issue.creator && req.role !== 'admin') {
          const error = new Error('Not Authorized!');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else {
          issue.title = title;
          issue.description = description;
          issue.files = files;
          issue.assignTo = assignTo;
          await issue.save();
          const activity = new Activity({
            activity: 'editIssue',
            owner: req.userId,
            issue: issue._id
          });
          await activity.save();
          res.status(201).json({
            message: 'Issue Updated Successfully!',
            data: issue
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
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
  },

  deleteIssue: async (req, res, next) => {
    try {
      const issueId = req.params.issueId;
      const issue = await Issue.findById(issueId);
      if (!issue) {
        const error = new Error('Issue Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (req.userId !== issue.creator && req.role !== 'admin') {
          const error = new Error('Not Authorized!');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else {
          await Comment.deleteMany({ issue: issue._id });
          await Issue.findByIdAndRemove(issueId, { useFindAndModify: false });
          const activity = new Activity({
            activity: 'deleteIssue',
            owner: req.userId,
            issue: issue._id
          });
          await activity.save();
          res.status(200).json({message: 'Issue Deleted Successfully'});
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};
