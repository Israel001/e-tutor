const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  organizer: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  status: {
    type: String,
    required: true
  },
  members: [
    {
      ref: 'User',
      type: Schema.Types.ObjectId,
      required: true
    }
  ],
  acceptToken: String,
  acceptTokenExpiration: Date,
  requestPending: {
    type: Number,
    default: 0
  },
  accepts: [
    {
      ref: 'User',
      type: Schema.Types.ObjectId
    },
  ],
  rejects: [
    {
      ref: 'User',
      type: Schema.Types.ObjectId
    },
  ]
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
