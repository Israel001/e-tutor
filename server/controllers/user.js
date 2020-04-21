const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../models/user');
const Message = require('../models/message');
const Issue = require('../models/issue');

module.exports = {
  createUser: async (req, res, next) => {
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const errorData = errors.array();
          const error = new Error(errorData[0].msg);
          error.data = errorData;
          res.status(422).json({
            message: error.message,
            data: { error },
          });
        } else {
          const name = req.body.name;
          const email = req.body.email;
          const password = req.body.password;
          const image = req.body.image;
          const role = req.body.role;
          const hashedPassword = await bcrypt.hash(password, 12);
          const user = new User({
            name,
            email: email,
            password: hashedPassword,
            role: role,
            image
          });
          const createdUser = await user.save();
          res.status(201).json({
            message: 'User Created Successfully!',
            data: { userId: createdUser._id.toString() }
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getUserInfo: async (req, res, next) => {
    try {
      const userId = req.query.userId;
      const user = await User.findOne({
        _id: mongoose.Types.ObjectId(userId)
      }).populate('students').populate('tutor');
      if (user) {
        res.status(200).json({
          message: 'User Information Retrieved Successfully',
          data: { user }
        });
      } else {
        const error = new Error('User Not Found!');
        res.status(404).json({
          message: error.message,
          data: { error }
        });
      }
    } catch (err) {
      if (!err) err.statusCode = 500;
      next(err);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = parseInt(req.query.perPage) || 10;
      const totalItems = await User.find().countDocuments();
      const users = await User
        .find()
        .populate('students')
        .populate('tutor')
        .skip((currentPage - 1) * perPage).limit(perPage);
      res.status(200).json({
        message: 'Users Retrieved Successfully',
        data: users, totalItems
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },
  
  getAllStudents: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = req.query.perPage || 10;
      const totalItems = await User.find({ role: 'student' }).countDocuments();
      const students = await User
        .find({role: 'student'})
        .populate('tutor');
      res.status(200).json({
        message: 'Students Retrieved Successfully',
        data: students, totalItems
      }).skip((currentPage - 1) * perPage).limit(perPage);
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getActiveTutors: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = parseInt(req.query.perPage) || 6;
      const totalItems = await User.find({
        role: 'tutor',
        active: true
      }).countDocuments();
      const activeTutors = await User.find({
        role: 'tutor',
        active: true
      }).skip((currentPage - 1) * perPage).limit(perPage);
      res.status(200).json({
        message: 'Active Tutors Fetched Successfully!',
        data: { activeTutors, totalItems }
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getTutors: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = req.query.perPage || 10;
      const totalItems = await User.find({ role: 'tutor' }).countDocuments();
      const tutors = await User
        .find({ role: 'tutor' })
        .populate('students')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
      res.status(200).json({
        message: 'Tutors Fetched Successfully!',
        data: tutors, totalItems
      });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },
  
  getAllAdmins: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = req.query.perPage || 10;
      const totalItems = await User.find({ role: 'admin' }).countDocuments();
      const admins = await User.find({role: 'admin'});
      res.status(200).json({
        message: 'Admins Retrieved Successfully',
        data: admins, totalItems
      }).skip((currentPage - 1) * perPage).limit(perPage);
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getAllAllocatedStudents: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = req.query.perPage || 10;
      const totalItems = await User.find({
        tutor: { $ne: null },
        role: 'student'
      }).countDocuments();
      const allocatedStudents = await User.find({
        tutor: { $ne: null },
        role: 'student'
      }).populate('tutor');
      res.status(200).json({
        message: 'All Allocated Students Retrieved Successfully',
        data: allocatedStudents, totalItems
      }).skip((currentPage - 1) * perPage).limit(perPage);
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getAllUnallocatedStudents: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage =  req.query.perPage || 10;
      const totalItems = await User.find({
        tutor: null,
        role: 'student'
      }).countDocuments();
      const unallocatedStudents = await User.find({
        tutor: null,
        role: 'student'
      });
      res.status(200).json({
        message: 'All Unallocated Students Retrieved Successfully',
        data: unallocatedStudents, totalItems
      }).skip((currentPage - 1) * perPage).limit(perPage);
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getAllAllocatedTutors: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = req.query.perPage || 10;
      const totalItems = await User.find({
        studentsLength: { $gt: 0 },
        role: 'tutor'
      }).countDocuments();
      const allocatedTutors = await User.find({
        studentsLength: { $gt: 0 },
        role: 'tutor'
      }).populate('students');
      res.status(200).json({
        message: 'All Allocated Tutors Retrieved Successfully',
        data: allocatedTutors, totalItems
      }).skip((currentPage - 1) * perPage).limit(perPage);
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getAllUnallocatedTutors: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = req.query.perPage || 10;
      const totalItems = await User.find({
        studentsLength: 0,
        role: 'tutor'
      }).countDocuments();
      const unallocatedTutors = await User.find({
        studentsLength: 0,
        role: 'tutor'
      });
      res.status(200).json({
        message: 'All Unallocated Tutors Retrieved Successfully',
        data: unallocatedTutors, totalItems
      }).skip((currentPage - 1) * perPage).limit(perPage);
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getAllActiveUsers: async (req, res, next) => {
    try {
      const currentPage =req.query.page || 1;
      const perPage = req.query.perPage || 10;
      const totalItems = await User.find({ active: true }).countDocuments();
      const activeUsers = await User
        .find({active: true})
        .populate('students')
        .populate('tutor');
      res.status(200).json({
        message: 'All Active Users Retrieved Successfully',
        data: activeUsers, totalItems
      }).skip((currentPage - 1) * perPage).limit(perPage);
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getAllInactiveUsers: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1;
      const perPage = req.query.perPage || 10;
      const totalItems = await User.find({ active: false }).countDocuments();
      const inactiveUsers = await User
        .find({active: false})
        .populate('students')
        .populate('tutor');
      res.status(200).json({
        message: 'All Inactive Users Retrieved Successfully',
        data: inactiveUsers, totalItems
      }).skip((currentPage - 1) * perPage).limit(perPage);
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
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: 'Not Authorized!',
          data: { error }
        });
      } else {
        const tutorId = req.body.tutorId;
        const studentId = req.body.stdId;
        const students = [];
        const tutor = await User.findOne({
          _id: mongoose.Types.ObjectId(tutorId),
          role: 'tutor'
        });
        if (tutor) {
          const tutorStudentsLength = tutor.students.length;
          if (studentId.length > 10) {
            const error = new Error('Only 10 students can be assigned at once');
            res.status(413).json({
              message: 'Only 10 students can be assigned at once',
              data: {error}
            });
          } else if (tutorStudentsLength === 10) {
            const error = new Error('You cannot assign any more students to this tutor');
            res.status(405).json({
              message: 'You cannot assign any more students to this tutor',
              data: {error}
            });
          } else if (tutorStudentsLength + studentId.length > 10) {
            const error = new Error(`You can only assign ${10 - tutorStudentsLength} more students to this tutor`);
            res.status(405).json({
              message: `You can only assign ${10 - tutorStudentsLength} more students to this tutor`,
              data: {error}
            });
          } else {
            for (let i = 0; i < studentId.length; i++) {
              const student = await User.findOne({
                _id: mongoose.Types.ObjectId(studentId[i]),
                role: 'student'
              });
              if (student) {
                students.push(student);
              } else {
                const error = new Error('One of the users provided does not exist');
                res.status(404).json({
                  message: 'One of the users provided does not exist',
                  data: {error}
                });
              }
            }
            for (let i = 0; i < students.length; i++) {
              tutor.students.push(students[i]._id);
            }
            for (let i = 0; i < students.length; i++) {
              students[i].tutor = tutor._id;
              students[i].save();
            }
            tutor.studentsLength = tutor.students.length;
            const updatedTutor = await tutor.save();
            res.status(201).json({
              message: 'Assign successfully',
              data: { updatedTutor }
            });
          }
        } else {
          const error = new Error('One of the users provided does not exist');
          error.statusCode = 404;
          res.status(404).json({
            message: 'One of the users provided does not exist',
            data: {error}
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  removeUserFromTutor: async (req, res, next) => {
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: 'Not Authorized!',
          data: { error }
        });
      } else {
        const tutorId = req.body.tutorId;
        const studentId = req.body.stdId;
        const students = [];
        const tutor = await User.findOne({
          _id: mongoose.Types.ObjectId(tutorId),
          role: 'tutor'
        });
        if (tutor) {
          for (let i = 0; i < studentId.length; i++) {
            const student = await User.findOne({
              _id: mongoose.Types.ObjectId(studentId[i]),
              role: 'student'
            });
            if (student) {
              students.push(student);
            } else {
              const error = new Error('One of the users provided does not exist');
              res.status(404).json({
                message: error.message,
                data: { error }
              });
            }
          }
          if (tutor.students.length <= 0) {
            const error = new Error('There is no students to unassign from this tutor');
            res.status(405).json({
              message: error.message,
              data: { error }
            });
          } else {
            for (let i = 0; i < students.length; i++) {
              tutor.students = tutor.students.filter(
                std => std.toString() !== students[i]._id.toString()
              );
              students[i].tutor = null;
              students[i].save();
            }
            tutor.studentsLength = tutor.students.length;
            const updatedTutor = await tutor.save();
            res.status(201).json({
              message: 'Unassigned Students and Tutor Successfully',
              data: {updatedTutor}
            });
          }
        } else {
          const error = new Error('One of the users provided does not exist');
          res.status(404).json({
            message: error.message,
            data: { error }
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
      const role = req.body.role;
      if (req.userId !== userId && req.role !== 'admin') {
        const error = new Error('You cannot update other users info');
        res.status(405).json({
          message: error.message,
          data: { error }
        });
      } else {
        const user = await User.findById(userId);
        if (user) {
          if (req.role === 'admin') {
            user.name = name;
            user.email = email;
            user.password = await bcrypt.hash(password, 12);
            user.role = role;
          } else {
            user.name = name;
          }
          await user.save();
          res.status(201).json({
            message: 'User Updated Successfully',
            data: { userId: user._id.toString() }
          });
        } else {
          const error = new Error('User Not Found');
          res.status(404).json({
            message: error.message,
            data: { error }
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  deactivateUser: async (req, res, next) => {
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (user) {
          user.active = false;
          await user.save();
          res.status(201).json({
            message: 'User Deactivated Successfully',
            data: { userId: user._id.toString() }
          });
        } else {
          const error = new Error('User not found');
          res.status(404).json({
            message: error.message,
            data: { error }
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  activateUser: async (req, res, next) => {
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (user) {
          user.active = true;
          await user.save();
          res.status(201).json({
            message: 'User Activated Successfully',
            data: { userId: user._id.toString() }
          });
        } else {
          const error = new Error('User not found');
          res.status(404).json({
            message: error.message,
            data: { error }
          });
        }
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      if (req.role !== 'admin') {
        const error = new Error('Not Authorized!');
        res.status(403).json({
          message: error.message,
          data: { error }
        });
      } else {
        const userId = req.params.userId;
        await User.findByIdAndRemove(userId, { useFindAndModify: false });
        res.status(200).json({message: 'User Deleted Successfully',});
      }
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  },

  getListOfIssues: async (req, rex, next) => {
    const userId = req.body.userId;
    try {
      const issue = await Issue.findOne({
        assignTo: userId
      });
      if (!issue) {
        const error = new Error('You do not have any issue');
        error.statusCode = 404;
        res.status(error.statusCode).json({
          message: 'You do not have any issue',
          data: { error }
        });
      }
      res.status(200).json({
        message: 'All Issues assign to you',
        data: { issue }
      });
    } catch (err) {
      // Forward errors to the universal error handler
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }
};
