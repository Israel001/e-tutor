const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  activity: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issue: {
    type: Schema.Types.ObjectId,
    ref: 'Issue'
  },
  meeting: {
    type: Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Blog'
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
