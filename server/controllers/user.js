const User = require('../models/user');
const Message = require('../models/message');

module.exports = {
  getTutors: async (req, res, next) => {
    try {
      const tutors = await User.find({ role: 'tutor' });
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
      const user = await User.findById(userId);
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
      console.log(userStudents);
      res.status(200).json({
        message: 'User Tutors And Students Fetched Successfully!',
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
  },

  searchUsers: async (req, res, next) => {
    const searchQuery = req.query.searchQuery;
    try {
      const users = await User.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } }
        ]
      });
      if (!users) res.status(404).send({ message: 'User Not Found!' });
      res.status(200).send({
        message: 'Users Fetched Successfully!',
        data: { users }
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  assignUser: async (req, res, next) => {
    const tutorEmail = req.body.tutorEmail;
    const studentEmail = req.body.stdEmail;
    try {
      const tutor = await User.findOne({ email: tutorEmail });
      const student = await User.findOne({ email: studentEmail });
      if (!tutor && !student) {
        const error = new Error('Could not find a user with that email');
        error.statusCode = 401;
        res.status(401).json({
          message: 'Could not find a user with that email',
          data: { error }
        });
      } else if (tutor && student) {
        const tutorId = tutor._id;
        const studentId = student._id;

        tutor.students.push(studentId);
        student.tutors.push(tutorId);

        const updatedTutor = await tutor.save();
        const updatedStudent = await student.save();

        res.status(200).json({
          message: 'Assign successfully',
          User: { updatedTutor, updatedStudent }
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  removeUserFromTutor: async (req, res, next) => {
    const tutorEmail = req.body.tutorEmail;
    const studentEmail = req.body.stdEmail;
    try {
      const tutor = await User.findOne({ email: tutorEmail });
      const student = await User.findOne({ email: studentEmail });
      if (!tutor && !student) {
        const error = new Error('Could not find a user with that email');
        error.statusCode = 401;
        res.status(401).json({
          message: 'Could not find a user with that email',
          data: { error }
        });
      } else if (tutor && student) {
        const tutorId = tutor._id;
        const studentId = student._id;

        tutor.students = tutor.students
          .filter(std => std.toString() !== studentId.toString());
        const updatedTutor = await tutor.save();

        student.tutors = [];
        const updatedStudent = await student.save();

        res.status(200).json({
          message: 'Remove Student and Tutor form User successfully',
          group: { updatedTutor, updatedStudent }
        });
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};