const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Authentication middleware to validate the token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Update username and/or password
router.put('/myaccount', authenticateToken, async (req, res) => {
    try {
        const { newUsername, newPassword } = req.body;

        if (!newUsername && !newPassword) {
            return res.status(400).json({ error: 'No data provided to update' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (newUsername) {
            user.username = newUsername;
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();
        res.json({ message: 'User information updated successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

module.exports = router;
