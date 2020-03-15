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
    role: {
        type: String,
        required: true
    },
    tutors: [
        {
            ref: 'User',
            type: Schema.Types.ObjectId
        }
    ],
    students: [
        {
            ref: 'User',
            type: Schema.Types.ObjectId
        }
    ],
    resetToken: String,
    resetTokenExpiration: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);