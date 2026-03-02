'use strict';

/**
 * db.js — Pure-JS JSON file database
 *
 * Stores data in botza-data.json beside this file.
 * No native modules required — works on any Node.js install.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'botza-data.json');

// ── Default schema ────────────────────────────────────────────
const DEFAULT_DB = {
  users: [],   // { id, email, password_hash, role, created_at }
  subscribers: [],   // { id, email, created_at }
  requests: [],   // { id, name, email, type, message, created_at }
};

// ── Helpers ───────────────────────────────────────────────────
function load() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function nextId(arr) {
  return arr.length === 0 ? 1 : Math.max(...arr.map((r) => r.id)) + 1;
}

function nowISO() {
  return new Date().toISOString();
}

// ── Public db API ─────────────────────────────────────────────
const db = {

  // USERS
  users: {
    findByEmail(email) {
      const data = load();
      return data.users.find((u) => u.email === email.toLowerCase()) || null;
    },
    findById(id) {
      const data = load();
      return data.users.find((u) => u.id === id) || null;
    },
    create({ email, password_hash, role = 'user' }) {
      const data = load();
      if (data.users.some((u) => u.email === email.toLowerCase())) {
        throw Object.assign(new Error('Email already registered'), { code: 'DUPLICATE' });
      }
      const user = {
        id: nextId(data.users),
        email: email.toLowerCase(),
        password_hash,
        role,
        created_at: nowISO(),
      };
      data.users.push(user);
      save(data);
      return user;
    },
  },

  // SUBSCRIBERS
  subscribers: {
    findByEmail(email) {
      const data = load();
      return data.subscribers.find((s) => s.email === email.toLowerCase()) || null;
    },
    create(email) {
      const data = load();
      if (data.subscribers.some((s) => s.email === email.toLowerCase())) {
        return null; // already exists
      }
      const sub = {
        id: nextId(data.subscribers),
        email: email.toLowerCase(),
        created_at: nowISO(),
      };
      data.subscribers.push(sub);
      save(data);
      return sub;
    },
    all() {
      return load().subscribers;
    },
  },

  // REQUESTS
  requests: {
    create({ name, email, type, message }) {
      const data = load();
      const req = {
        id: nextId(data.requests),
        name: name || null,
        email: email.toLowerCase(),
        type,
        message: message || null,
        created_at: nowISO(),
      };
      data.requests.push(req);
      save(data);
      return req;
    },
    all() {
      return load().requests;
    },
  },
};

module.exports = db;
