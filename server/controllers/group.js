const io = require('../socket');
const Group = require('../models/group');
const Message = require('../models/message');
const User = require('../models/user');

module.exports = {
  createGroup: async (req, res, next) => {
    const creator = req.userId;
    const title = req.body.title;
    const image = req.body.image;
    const members = req.body.members;
    members.push(creator);
    const group = new Group({
      title,
      creator,
      image,
      members,
      messages: []
    });
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        error.statusCode = 403;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      await group.save();
      res.status(201).json({
        message: 'Group created successfully!',
        data: { group }
      });
    } catch(err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getGroupInfo: async (req, res, next) => {
    try {
      const groupId = req.params.groupId;
      const group = await Group.findById(groupId).populate('members');
      if (!group) {
        const error = new Error('Group Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      } else {
        if (!group.members.includes(req.userId) && req.role !== 'admin') {
          const error = new Error('Not Authorized!');
          res.status(403).json({
            message: error.message,
            data: { error }
          });
        } else {
          res.status(200).json({
            message: 'Group Information Retrieved Succesfully!',
            data: { group }
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getGroups: async (req, res, next) => {
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        const groups = await Group.find().populate('creator').populate('members');
        res.status(200).json({
          message: 'Groups Retrieved Successfully!',
          data: groups
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getGroupMessages: async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const groupId = req.query.groupId;
    const perPage = 10;
    try {
      const messages = await Group.findById(groupId)
        .select('messages').populate('messages')
        .skip((currentPage - 1) * perPage).limit(perPage);
      res.status(200).json({
        message: 'Group Messages Fetched Successfully!',
        data: { messages }
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getUserGroups: async (req, res, next) => {
    try {
      const groups = await Group.find({
        members: { $in: req.userId }
      }).populate('creator').populate('members')
        .populate('messages').sort({createdAt: -1});
      res.status(200).json({
        message: "User's Group Fetched Successfully",
        data: { groups }
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  addUserToGroup: async (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        error.statusCode = 403;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      const group = await Group.findById(groupId);
      if (!group) {
        const error = new Error('Group not found');
        error.statusCode = 404;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      const user = await User.findById(userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      for (let i = 0; i < group.members.length; i++) {
        if (group.members[i].toString() === userId.toString()) {
          const error = new Error('User is already in the group');
          error.statusCode = 422;
          // noinspection ExceptionCaughtLocallyJS
          throw error;
        }
      }
      group.members.push(userId);
      const updatedGroup = await group.save();
      // io.getIO().to(groupId).emit('group', {
      //   action: 'add_user', group: updatedGroup
      // });
      res.status(200).json({
        message: 'User has been added to the group successfully',
        group: updatedGroup
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  removeUserFromGroup: async (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        error.statusCode = 403;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      const group = await Group.findById(groupId);
      if (!group) {
        const error = new Error('Group not found');
        error.statusCode = 404;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      const user = await User.findById(userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      group.members = group.members
        .filter(el => el.toString() !== userId.toString());
      const updatedGroup = await group.save();
      // io.getIO().to(groupId).emit('group', {
      //   action: 'remove_user', group: updatedGroup
      // });
      res.status(200).json({
        message: 'User has been removed from the group successfully',
        group: updatedGroup
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  updateGroup: async (req, res, next) => {
    const groupId = req.params.groupId;
    const title = req.body.title;
    try {
      const group = await Group.findById(groupId).populate('creator');
      if (!group) {
        const error = new Error('Group not found');
        error.statusCode = 404;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      if (group.creator._id.toString() !== req.userId.toString()) {
        const error = new Error('Not Authorized!');
        error.statusCode = 403;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      group.title = title;
      const updatedGroup = await group.save();
      // io.getIO().to(groupId).emit('group', {
      //   action: 'update', group: updatedGroup
      // });
      res.status(200).json({
        message: 'Group Updated Successfully',
        group: updatedGroup
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  deleteGroup: async (req, res, next) => {
    const groupId = req.params.groupId;
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        const error = new Error('Group not found');
        error.statusCode = 404;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      if (group.creator.toString() !== req.userId) {
        const error = new Error('Not Authorized!');
        error.statusCode = 403;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      for (let i = 0; i <= group.messages.length; i++) {
        await Message.findByIdAndRemove(group.messages[i]);
      }
      await Group.findByIdAndRemove(groupId);
      // io.getIO().to(groupId).emit('group', {
      //   action: 'delete',
      //   group: groupId
      // });
      res.status(200).json({message: 'Deleted group successfully'});
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};
