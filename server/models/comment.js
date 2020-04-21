const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
