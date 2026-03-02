'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRouter = require('./routes/auth');
const newsletterRouter = require('./routes/newsletter');
const contactRouter = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
    origin: [
        process.env.FRONTEND_ORIGIN || 'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:5500',   // Live Server (VS Code)
        'http://127.0.0.1:5500',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// ── Body Parsing ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve static frontend files ───────────────────────────────
// The backend folder is inside Botza_new/, so parent dir = Botza_new/
const STATIC_DIR = path.join(__dirname, '..');
app.use(express.static(STATIC_DIR));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/contact', contactRouter);

// ── Helpdesk Mock API (Public Endpoints) ──────────────────────
const DUMMY_FAQS = [
    { id: 'f1', question: 'How do I change my subscription plan?', answerText: 'You can change your plan at any time in the Billing section of your account settings.', category: 'Billing' },
    { id: 'f2', question: 'Can I share my account with team members?', answerText: 'Yes — Botza supports multi-user workspaces with role-based access control.', category: 'Account' },
    { id: 'f3', question: 'What payment methods are accepted?', answerText: 'We accept all major credit cards, bank transfers, and enterprise invoicing.', category: 'Billing' },
    { id: 'f4', question: 'How do I reset my password?', answerText: 'On the login page, click "Forgot password?" and enter your work email.', category: 'Sign-in/Login Issues' },
    { id: 'f5', question: 'Is my data secure and compliant?', answerText: 'All data is encrypted at rest and in transit.', category: 'Security' },
];

const DUMMY_TOPICS = [
    { id: 't1', title: 'Account Initialization', description: 'Set up your Botza profile and workspace rules.' },
    { id: 't2', title: 'Billing & Subscriptions', description: 'Manage plans, invoices, and payment methods.' },
    { id: 't3', title: 'Security & Privacy', description: 'Learn about our SOC2 compliance and data encryption.' },
    { id: 't4', title: 'Technical Integration', description: 'Connect Botza to your existing tech stack via API.' },
];

const DUMMY_VIDEOS = [
    { id: 'video_123', title: 'Welcome to Botza', description: 'A quick getting started guide to navigating our new support platform.', category: 'Tutorial', durationSeconds: 125, viewCount: 1420, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=700&auto=format&fit=crop' },
    { id: 'video_124', title: 'Managing Team Roles', description: 'How to assign and remove admin privileges for your team members.', category: 'Account', durationSeconds: 340, viewCount: 890, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=700&auto=format&fit=crop' },
    { id: 'video_125', title: 'API Integration Basics', description: 'Learn how to generate tokens and connect Botza to your app.', category: 'Technical Integration', durationSeconds: 615, viewCount: 2100, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=700&auto=format&fit=crop' },
];


app.get('/api/v1/public/faqs', (req, res) => {
    const cat = req.query.category;
    const filtered = cat ? DUMMY_FAQS.filter(f => f.category.toLowerCase() === cat.toLowerCase()) : DUMMY_FAQS;
    res.json({ success: true, data: filtered, pagination: { totalPages: 1, hasMore: false } });
});

app.get('/api/v1/public/faqs/:id', (req, res) => {
    const faq = DUMMY_FAQS.find(f => f.id === req.params.id);
    if (faq) res.json({ success: true, data: faq });
    else res.status(404).json({ success: false, error: 'Not found' });
});

app.get('/api/v1/public/categories', (req, res) => {
    const cats = [...new Set(DUMMY_FAQS.map(f => f.category))];
    res.json({ success: true, data: cats });
});

app.get('/api/v1/public/topics', (req, res) => {
    res.json({ success: true, data: DUMMY_TOPICS });
});

app.get('/api/v1/public/videos', (req, res) => {
    const cat = req.query.category;
    const filtered = cat ? DUMMY_VIDEOS.filter(v => v.category.toLowerCase() === cat.toLowerCase()) : DUMMY_VIDEOS;
    res.json({ success: true, data: filtered, pagination: { totalPages: 1, hasMore: false } });
});

app.get('/api/v1/public/videos/:id', (req, res) => {
    const vid = DUMMY_VIDEOS.find(v => v.id === req.params.id);
    if (vid) res.json({ success: true, data: vid });
    else res.status(404).json({ success: false, error: 'Not found' });
});


app.post('/api/v1/public/search', (req, res) => {
    const q = (req.body.query || '').toLowerCase();

    // Search FAQs
    const faqResults = DUMMY_FAQS.filter(f => f.question.toLowerCase().includes(q) || f.answerText.toLowerCase().includes(q))
        .map(f => ({ id: f.id, type: 'faq', title: f.question, snippet: f.answerText, category: f.category }));

    // Search Videos
    const videoResults = DUMMY_VIDEOS.filter(v => v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q))
        .map(v => ({ id: v.id, type: 'video', title: v.title, snippet: v.description, category: v.category }));

    const results = [...faqResults, ...videoResults];

    res.json({ success: true, data: { query: req.body.query, results } });
});


// ── 404 for unknown API routes ────────────────────────────────
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// ── Fallback — serve index.html for non-API routes ───────────
app.get('*', (req, res) => {
    res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// ── Global Error Handler ──────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    console.error('[ERROR]', err.message);
    const status = err.status || 500;
    res.status(status).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   BOTZA Backend Server                       ║
║   Listening on http://localhost:${PORT}         ║
║   Frontend dev served at http://localhost:5173 ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
