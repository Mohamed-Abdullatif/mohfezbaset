const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM progress WHERE user_id = ?').all(req.user.id);
  res.json(rows);
});

router.post('/', auth, (req, res) => {
  const { surah_number, memorized_ayahs, total_ayahs, day } = req.body;
  const prev = db.prepare('SELECT memorized_ayahs FROM progress WHERE user_id = ? AND surah_number = ?')
    .get(req.user.id, surah_number);
  const gained = memorized_ayahs - (prev ? prev.memorized_ayahs : 0);
  if (gained > 0) {
    const today = /^\d{4}-\d{2}-\d{2}$/.test(day || '') ? day : new Date().toISOString().slice(0, 10);
    db.prepare(`
      INSERT INTO daily_log (user_id, day, ayahs) VALUES (?, ?, ?)
      ON CONFLICT(user_id, day) DO UPDATE SET ayahs = ayahs + excluded.ayahs
    `).run(req.user.id, today, gained);
  }
  db.prepare(`
    INSERT INTO progress (user_id, surah_number, memorized_ayahs, total_ayahs, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, surah_number) DO UPDATE SET
      memorized_ayahs = excluded.memorized_ayahs,
      total_ayahs = excluded.total_ayahs,
      updated_at = CURRENT_TIMESTAMP
  `).run(req.user.id, surah_number, memorized_ayahs, total_ayahs);
  res.json({ success: true });
});

module.exports = router;
