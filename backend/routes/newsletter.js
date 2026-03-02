'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── POST /api/newsletter/subscribe ──────────────────────────
router.post('/subscribe', (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });
        if (!EMAIL_RE.test(email.trim())) return res.status(400).json({ error: 'Invalid email format' });

        const result = db.subscribers.create(email.trim());
        if (!result) {
            return res.json({ message: 'Already subscribed — you are on our list!' });
        }
        return res.status(201).json({ message: "Subscribed successfully. We'll be in touch!" });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/newsletter/subscribers ─────────────────────────
router.get('/subscribers', (req, res) => {
    const rows = db.subscribers.all();
    return res.json({ count: rows.length, subscribers: rows });
});

module.exports = router;
