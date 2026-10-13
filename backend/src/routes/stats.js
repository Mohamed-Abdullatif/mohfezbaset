const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/stats — return visitor count
router.get('/', (req, res) => {
  const row = db.prepare('SELECT value FROM site_stats WHERE key = ?').get('visitors');
  res.json({ visitors: row ? row.value : 0 });
});

// POST /api/stats/visit — increment visitor count
router.post('/visit', (req, res) => {
  db.prepare('UPDATE site_stats SET value = value + 1 WHERE key = ?').run('visitors');
  const row = db.prepare('SELECT value FROM site_stats WHERE key = ?').get('visitors');
  res.json({ visitors: row.value });
});

module.exports = router;
