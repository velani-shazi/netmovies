const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Comment = require('../models/comment');

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Create comment
router.post('/comments', authenticateToken, async (req, res) => {
    try {
        const { mediaId, type, text } = req.body;
        console.log(req.body.username);
        const comment = new Comment({
            mediaId,
            mediaType: type,
            text,
            userId: req.user.id,
            username: req.body.username,
        });
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// Get comments for media
router.get('/comments', authenticateToken, async (req, res) => {
    try {
        const { mediaId, type } = req.query;
        const comments = await Comment.find({
            mediaId,
            mediaType: type
        }).sort({ timestamp: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Delete comment
router.delete('/comments/:id', authenticateToken, async (req, res) => {
    try {
        const commentId = req.params.id;

        // Find the comment by ID
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        // Check if the authenticated user is the owner of the comment
        if (comment.userId.toString() !== req.user.id) {
            console.log(comment.userId.toString(), req.user.id);
            return res.status(403).json({ error: 'You are not authorized to delete this comment' });
        }

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;