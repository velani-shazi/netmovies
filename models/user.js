const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    resetToken: String,
    resetTokenExpiry: Date,
    library: [
        {
            id: String,
            type: String,
            title: String,
            posterPath: String,
        },
    ],
});

module.exports = mongoose.model('User', userSchema);
