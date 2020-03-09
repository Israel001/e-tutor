const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    users: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        }
      }
    ]
  },
  message: { type: String, required: true},
  editHistory: {
    messages: [
      { message: String }
    ]
  },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);