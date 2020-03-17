const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  message: { type: String, required: true},
  editHistory: {
    messages: [
      String
    ]
  },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);