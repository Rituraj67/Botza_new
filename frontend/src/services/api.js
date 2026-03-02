'use strict';

/* ============================================================
   api.js — Botza backend service layer
   All fetch calls to the Express backend go through here.
   The Vite proxy routes /api/* → http://localhost:3001
   ============================================================ */

const API = '/api';

async function request(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    const token = localStorage.getItem('botza_token');
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API}${path}`, opts);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const err = new Error(data.error || 'Request failed');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

// ── Auth ──────────────────────────────────────────────────────
export const login = (email, password) => request('POST', '/auth/login', { email, password });
export const register = (email, password, role) => request('POST', '/auth/register', { email, password, role });
export const getMe = () => request('GET', '/auth/me');

// ── Newsletter ────────────────────────────────────────────────
export const subscribe = (email) => request('POST', '/newsletter/subscribe', { email });

// ── Contact ───────────────────────────────────────────────────
export const requestDemo = (name, email, message) => request('POST', '/contact/demo', { name, email, message });
export const requestAccess = (name, email, message) => request('POST', '/contact/request-access', { name, email, message });
