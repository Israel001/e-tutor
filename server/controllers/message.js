const io = require('../socket');
const Message = require('../models/message');

module.exports = {
  sendMessage: async (req, res, next) => {
    // Initialize data to be stored in the database
    const from = req.userId;
    const to = req.body.to;
    const content = req.body.message;
    const groupId = req.body.groupId;
    // Create and Store a Message Schema Object with the initialized data
    const message = new Message({
      from,
      to: { users: to },
      message: content,
      editHistory: { messages: [] }
    });
    try {
      // Save the data to the database
      await message.save();
      // Broadcast "send message" event
      if (groupId != null) {
        io.getIO().to(groupId).emit('message', {
          action: 'send',
          message: {...message._doc}
        });
      } else {
        io.getIO().socket.broadcast.to(io.getSocketId()).emit('message', {
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
    const otherUsers = req.query.users;
    const perPage = 2;
    try {
      const totalItems = await Message.find().countDocuments();
      const messages = await Message
        .find({
          isDeleted: false,
          $or: [
            {
              $and: [
                { from: req.userId },
                { to: { 'users.userId': { $in: otherUsers } } }
              ]
            },
            {
              $and: [
                { from: { $in: otherUsers } },
                { to: { 'users.userId': req.userId } }
              ]
            }
          ]
        }, 'from to message')
        .populate('from').populate('to.users.userId')
        .sort({createdAt: -1})
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
      res.status(200).json({
        message: 'Messages Fetched Successfully!',
        data: { messages, totalItems }
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
      message.editHistory.messages.push({ message: message.message });
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
      message.isDeleted = true;
      await message.save();
      io.getIO().emit('message', { action: 'delete', message: messageId });
      res.status(200).json({message: 'Message Deleted Successfully'});
    } catch(err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};