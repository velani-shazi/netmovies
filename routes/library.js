const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Middleware to authenticate user
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Save a show
router.post('/save', authenticateToken, async (req, res) => {
    const { id, type, title, posterPath } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        console.log(typeof id);
        user.library.push(JSON.stringify({ id: id, type, title, posterPath }));
        await user.save();
        res.json({ message: 'Show saved' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: `${err}` });
    }
});

// Get user's library
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user.library);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch library' });
    }
});

// Delete a show
router.delete('/delete', authenticateToken, async (req, res) => {
    const { id, type } = req.body;
    console.log(req.body);
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Filter out the show to be deleted
        user.library = user.library.filter((item) => {
            const parsedItem = JSON.parse(item);
            return !(parsedItem.id == id && parsedItem.type == type);
        });

        await user.save();
        res.json({ message: 'Show removed from library' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove the show' });
    }
});


module.exports = router;
