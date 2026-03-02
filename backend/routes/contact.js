'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── POST /api/contact/demo ───────────────────────────────────
router.post('/demo', (req, res, next) => {
    try {
        const { name, email, message } = req.body;
        if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });
        if (!EMAIL_RE.test(email.trim())) return res.status(400).json({ error: 'Invalid email format' });

        db.requests.create({ name, email: email.trim(), type: 'demo', message });
        return res.status(201).json({ message: "Demo request received! We'll be in touch soon." });
    } catch (err) {
        next(err);
    }
});

// ── POST /api/contact/request-access ────────────────────────
router.post('/request-access', (req, res, next) => {
    try {
        const { name, email, message } = req.body;
        if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });
        if (!EMAIL_RE.test(email.trim())) return res.status(400).json({ error: 'Invalid email format' });

        db.requests.create({ name, email: email.trim(), type: 'access', message });
        return res.status(201).json({ message: 'Access request received! Our team will review and get back to you.' });
    } catch (err) {
        next(err);
    }
});

// ── GET /api/contact/requests ────────────────────────────────
router.get('/requests', (req, res) => {
    const rows = db.requests.all();
    return res.json({ count: rows.length, requests: rows });
});

module.exports = router;
