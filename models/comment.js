const mongoose = require('mongoose');

// Comment Schema
const commentSchema = new mongoose.Schema({
    mediaId: { type: String, required: true },
    mediaType: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;