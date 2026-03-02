'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, role = 'user' } = req.body;

        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
        if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email format' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

        const hash = await bcrypt.hash(password, 12);
        const user = db.users.create({ email, password_hash: hash, role });

        return res.status(201).json({ message: 'User created', id: user.id });
    } catch (err) {
        if (err.code === 'DUPLICATE') return res.status(409).json({ error: 'Email already registered' });
        next(err);
    }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const user = db.users.findByEmail(email);
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

        const token = generateToken(user);
        return res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, role: user.role },
        });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        const user = db.users.findById(payload.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { password_hash, ...safe } = user;
        return res.json({ user: safe });
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        next(err);
    }
});

module.exports = router;
