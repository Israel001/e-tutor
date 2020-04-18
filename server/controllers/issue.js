const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;

const User = require('../models/user');
const Issue = require('../models/issue');

module.exports = {
    getIssues: async (req, res, next) => {
        const issueId = req.body.issueId;
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
            res.status(200).json({
                message: 'Issue Fetched Successfully!',
                data: { issue }
            });
        } catch (err) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        }
    },
    createIssue: async (req, res, next) => {
        const creator = req.body.userId;
        const title = req.body.title;
        const description = req.body.description;
        const assignTo = req.body.toUserId;
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
                data: { issue }
            });
        } catch (err) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        }
    },
    assignIssueToUser: async (req, res, next) => {
        const issueId = req.body.issueId;
        const assignToUserEmail = req.body.userEmail;
        try {
            const issue = await Issue.findById(issueId);
            const toUser = await User.findOne({ email: assignToUserEmail });
            if (!issue) {
                const error = new Error('The issue does not exist');
                error.statusCode = 404;
                res.status(error.statusCode).json({
                    message: 'Issue not found',
                    data: { error }
                });
            }
            if(!toUser){
                const error = new Error('User does not exist');
                error.statusCode = 404;
                res.status(error.statusCode).json({
                    message: 'User not found',
                    data: { error }
                });
            }
            issue.assignTo = toUser._id;
            const updatedIssue = await issue.save();
            res.status(200).json({
                message: 'Assign to User successfully',
                group: { updatedIssue }
            });
        } catch (err) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        }
    }
};

