const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;

const io = require('../socket');
const Message = require('../models/message');
const User = require('../models/user');
const Group = require('../models/group');

module.exports = {
  sendMessage: async (req, res, next) => {
    // Initialize data to be stored in the database
    const from = req.userId;
    const to = req.body.to;
    const content = req.body.message;
    const groupId = req.body.groupId;
    try {
      let group;
      for (let i = 0; i < to.length; i++) {
        if (!groupId) {
          const user = await User.findById(to[i]);
          if (!user) {
            const error = new Error(
              'You cannot message a user that does not exist!'
            );
            error.statusCode = 401;
            // noinspection ExceptionCaughtLocallyJS
            throw error;
          }
        } else {
          const group = await Group.findById(to[i]);
          if (!group) {
            const error = new Error(
              'You cannot message a group that does not exist!'
            );
            error.statusCode = 401;
            // noinspection ExceptionCaughtLocallyJS
            throw error;
          }
        }
      }

      if(groupId) {
        group = await Group.findById(groupId);
        if (!group) {
          const error = new Error('The group provided does not exist');
          error.statusCode = 401;
          // noinspection ExceptionCaughtLocallyJS
          throw error;
        }
      }

      // Create and Store a Message Schema Object with the initialized data
      const message = new Message({
        from,
        to,
        message: content,
        editHistory: { messages: [] }
      });

      if (!groupId) {
        for (let i = 0; i <= to.length; i++) {
          if (to[i] === from) {
            const error = new Error('You cannot message yourself');
            error.statusCode = 422;
            // noinspection ExceptionCaughtLocallyJS
            throw error;
          }
        }
      }
      // Save the data to the database
      const createdMessage = await message.save();
      if (groupId) {
        group = await Group.findOne({
          $and: [
            {
              _id: new ObjectID(groupId),
              members: { $in: from }
            }
          ]
        });
        if (!group) {
          const error = new Error('You are not a member of the group provided');
          error.statusCode = 403;
          // noinspection ExceptionCaughtLocallyJS
          throw error;
        }
        group.messages.push(createdMessage._id);
        await group.save();
      }
      // Broadcast "send message" event
      if (groupId) {
        io.getIO().to(groupId).emit('message', {
          action: 'send',
          message: {...message._doc}
        });
      } else {
        io.getIO().to(from + to[0]).emit('message', {
          action: 'send',
          message: {...message._doc}
        });
      }
      // Return a successful response
      res.status(201).json({
        message: 'Message sent successfully!',
        data: { message }
      });
    } catch(err) {
      // Forward errors to the universal error handler
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getMessages: async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const otherUsers = req.query.users.split(',');
    const perPage = 10;

    try {
      const messages = await Message
        .find({
          $or: [
            {
              $and: [
                { from: req.userId },
                { to: { $in: otherUsers } }
              ]
            },
            {
              $and: [
                { from: { $in: otherUsers } },
                { to: req.userId }
              ]
            }
          ]
        })
        .populate('from').populate('to')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
      res.status(200).json({
        message: 'Messages Fetched Successfully!',
        data: { messages }
      });
    } catch (err) {
      if (!err) err.statusCode = 500;
      next(err);
    }
  },

  updateMessage: async (req, res, next) => {
    const messageId = req.params.messageId;
    const content = req.body.message;
    try {
      const message = await Message.findById(messageId).populate('from');
      if (!message) {
        const error = new Error('Could not find message');
        error.statusCode = 404;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      if (message.from._id.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      message.editHistory.messages.push(message.message);
      message.message = content;
      const updatedMessage = await message.save();
      io.getIO().emit('message', { action: 'update', message: updatedMessage });
      res.status(200).json({
        message: 'Message Updated Successfully',
        data: { message: updatedMessage }
      });
    } catch(err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  deleteMessage: async (req, res, next) => {
    const userId = req.userId;
    const messageId = req.params.messageId;
    try {
      const message = await Message.findById(messageId).populate('from');
      if (!message) {
        const error = new Error('Could not find message');
        error.statusCode = 404;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      if (message.from._id.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
      await Message.findByIdAndRemove(messageId, { useFindAndModify: false });
      const group = await Group.findById(message.to[0]);
      if (group) {
        io.getIO().to(group._id).emit(
          'message',
          { action: 'delete', message: messageId }
        );
      } else {
        io.getIO().to(userId + message.to[0]).emit(
          'message',
          {action: 'delete', message: messageId}
        );
      }
      res.status(200).json({message: 'Message Deleted Successfully'});
    } catch(err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};
