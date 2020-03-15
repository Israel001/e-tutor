const io = require('../socket');
const Group = require('../models/group');
const Message = require('../models/message');

module.exports = {
  createGroup: async (req, res, next) => {
    const creator = req.userId;
    const title = req.body.title;
    const group = new Group({
      title,
      creator,
      members: [{ userId: creator }],
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

  getUserGroups: async (req, res, next) => {
    try {
      const groups = await Group.find({
        'members.userId': { $in: req.userId }
      }).populate('creator').populate('members.userId')
        .populate('messages.messageId').sort({createdAt: -1});
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
      group.members.users.push({userId});
      const updatedGroup = await group.save();
      io.getIO().to(groupId).emit('group', {
        action: 'add_user', group: updatedGroup
      });
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
      group.members.users.filter(el => el.userId.toString() !== userId.toString());
      const updatedGroup = await group.save();
      io.getIO().to(groupId).emit('group', {
        action: 'remove_user', group: updatedGroup
      });
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
      if (group.creator._id.toString() !== req.userId) {
        const error = new Error('Not Authorized!');
        error.statusCode = 403;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      group.title = title;
      const updatedGroup = await group.save();
      io.getIO().to(groupId).emit('group', {
        action: 'update', group: updatedGroup
      });
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
      for (let i = 0; i < group.content.messages; i++) {
        await Message.findByIdAndRemove(group.content.messages[i].messageId);
      }
      await Group.findByIdAndRemove(groupId);
      io.getIO().to(groupId).emit('group', {
        action: 'delete',
        group: groupId
      });
      res.status(200).json({message: 'Deleted group successfully'});
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};