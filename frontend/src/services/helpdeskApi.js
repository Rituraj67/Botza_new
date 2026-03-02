'use strict';

/* ============================================================
   helpdeskApi.js — Botza Public API Service
   
   These endpoints connect directly to the live Botza app where 
   FAQs are made, removing the need for local backend linking.
   ============================================================ */

const BASE = import.meta.env.VITE_HELPDESK_API_BASE || 'http://localhost:5050/api/v1/public';
const API_TOKEN = import.meta.env.VITE_HELPDESK_API_TOKEN;

export { API_TOKEN };

/* ── Shared request helper ───────────────────────────────── */
async function req(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            'X-API-Token': API_TOKEN, 
            ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

/* ── Get all FAQs (paginated, optional category filter) ── */
export function listFaqs({ page = 1, limit = 20, category } = {}) {
    let path = `/faqs?page=${page}&limit=${limit}`;
    if (category) path += `&category=${encodeURIComponent(category)}`;
    return req('GET', path);
}

/* ── Search FAQs + videos ────────────────────────────────── */
export function searchFaqs({ query, limit = 10, offset = 0, autosuggest = false, semantic = false }) {
    return req('POST', '/search', { query, limit, offset, autosuggest, semantic });
}

/* ── Get single FAQ by ID ────────────────────────────────── */
export function getFaq(id) {
    return req('GET', `/faqs/${id}`);
}

/* ── Get categories list ─────────────────────────────────── */
export function listCategories() {
    return req('GET', '/categories');
}

/* ── Get popular topics ──────────────────────────────────── */
export function listTopics() {
    return req('GET', '/topics');
}

/* ── Get all Published Videos ────────────────────────────── */
export function listVideos({ page = 1, limit = 20, category } = {}) {
    let path = `/videos?page=${page}&limit=${limit}`;
    if (category) path += `&category=${encodeURIComponent(category)}`;
    return req('GET', path);
}

/* ── Get single video by ID ──────────────────────────────── */
export function getVideo(id) {
    return req('GET', `/videos/${id}`);
}

