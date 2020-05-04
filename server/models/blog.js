const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    ref: 'User',
    type: Schema.Types.ObjectId,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  likesCount: {
    type: Number,
    default: 0
  },
  dislikesCount: {
    type: Number,
    default: 0
  },
  likes: [
    {
      ref: 'User',
      type: Schema.Types.ObjectId
    }
  ],
  dislikes: [
    {
      ref: 'User',
      type: Schema.Types.ObjectId
    }
  ],
  category: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
