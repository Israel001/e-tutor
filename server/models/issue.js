const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const issueSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    files: [{ type: String }],
    assignTo: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
