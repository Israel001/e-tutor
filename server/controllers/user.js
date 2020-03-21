const User = require('../models/user');
const Message = require('../models/message');

module.exports = {
  getTutors: async (req, res, next) => {
    try {
      const tutors = await User.find({role: 'tutor'});
      res.status(200).json({
        message: 'Tutors Fetched Successfully!',
        data: { tutors }
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getUserTutorsAndStudents: async (req, res, next) => {
    const userId = req.params.userId;
    if (req.role !== 'admin' && userId !== req.userId) {
      const error = new Error('Not Authorized!');
      error.statusCode = 403;
      res.status(error.statusCode).json({
        message: 'Not Authorized!',
        data: { error }
      });
    }
    try {
      const user = User.findById(userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        res.status(error.statusCode).json({
          message: 'User not found',
          data: { error }
        });
      }
      const userTutors = user.tutors;
      const userStudents = user.students;
      res.status(200).json({
        message: 'User Tutors Fetched Successfully!',
        data: { userTutors, userStudents }
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getConversations: async (req, res, next) => {
    try {
      const messages = await Message
        .find({
          isDeleted: false,
          $or: [
            { from: req.userId },
            { to: req.userId }
          ]
        }, 'from to');
      const allConversations = [];
      for (let i = 0; i < messages.length; i++) {
        messages[i].to.forEach(user => {
          if (!allConversations.includes(user.toString())) {
            allConversations.push(user.toString());
          }
        });
        if (!allConversations.includes(messages[i].from.toString())) {
          allConversations.push(messages[i].from.toString());
        }
      }
      const filteredConversations = [];
      for (let i = 0; i < allConversations.length; i++) {
        const user = await User.findById(allConversations[i]);
        if (user && user._id.toString() !== req.userId) {
          filteredConversations.push(user);
        }
      }
      res.status(200).json({
        message: 'Conversations Fetched Successfully!',
        data: { filteredConversations }
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};