const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;

const User = require('../models/user');
const Issue = require('../models/issue');
const Comment = require('../models/comment');

module.exports = {
    addComment: async (req, res, next) => {
        const fromUser = req.body.userId;
        const content = req.body.comment;
        const issueId = req.body.issueId;
        try {
            let issue;
            // Create and Store a Comment Schema Object
            const comment = new Comment({
                from: fromUser,
                comment: content
            });
            const createdComment = await comment.save();

            if (issueId) {
                issue = await Issue.findById(issueId);
                if (!issue) {
                    const error = new Error('The issue does not exist');
                    error.statusCode = 401;
                    throw error;
                }
                issue.arrayOfComments.push(createdComment._id);
                await issue.save();
            }
            // Return a successful response
            res.status(201).json({
                message: 'Add Comment sent successfully!',
                data: { issue, comment }
            });
        } catch (err) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        }
    },
    deleteComment: async (req, res, next) => {
        const userId = req.body.userId;
        const issueId = req.body.issueId;
        const commentId = req.body.commentId;
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
            if (comment.from._id.toString() !== userId.toString()) {
                const error = new Error('Not authorized to Delete this comment');
                error.statusCode = 403;
                throw error;
            }

            issue.arrayOfComments = issue.arrayOfComments
                .filter(cmt => cmt.toString() !== commentId.toString());

            const updatedIssue = await issue.save();
            await Comment.findByIdAndRemove(commentId);

            res.status(200).json({
                message: 'Remove Comment successfully',
                group: { updatedIssue }
            });
        } catch (err) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        }
    },
    editComment: async (req, res, next) => {
        const userId = req.body.userId;
        const issueId = req.body.issueId;
        const commentId = req.body.commentId;
        const updatedContent = req.body.comment;
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
            if (comment.from._id.toString() !== userId.toString()) {
                const error = new Error('Not authorized to Edit this comment');
                error.statusCode = 403;
                throw error;
            }
            comment.comment = updatedContent;
            const updatedComment = await comment.save();
            res.status(200).json({
                message: 'Updated Comment successfully',
                group: { updatedComment }
            });
        } catch (err) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        }
    }
};