const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  title: { type: String, required: true },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }
  ],
  messages: [
    {
      messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        required: true
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);