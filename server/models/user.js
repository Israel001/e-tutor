const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    image: {
      type: String,
      required: true
    },
    description: String,
    active: {
        type: Boolean,
        default: false
    },
    tutor: {
        ref: 'User',
        type: Schema.Types.ObjectId,
        default: null
    },
    students: [
        {
            ref: 'User',
            type: Schema.Types.ObjectId
        }
    ],
    studentsLength: {
        type: Number,
        default: 0
    },
    resetToken: String,
    resetTokenExpiration: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
