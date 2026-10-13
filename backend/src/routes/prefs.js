const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

const isDay = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
const shiftDay = (d, n) => {
  const t = new Date(d + 'T00:00:00Z');
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};

// Reading position, daily goal, today's count and current streak
router.get('/', auth, (req, res) => {
  const today = isDay(req.query.day) ? req.query.day : new Date().toISOString().slice(0, 10);
  const prefs = db.prepare('SELECT last_page, daily_goal FROM user_prefs WHERE user_id = ?').get(req.user.id)
    || { last_page: 1, daily_goal: 5 };

  const days = new Set(
    db.prepare('SELECT day FROM daily_log WHERE user_id = ? AND ayahs > 0').all(req.user.id).map(r => r.day)
  );
  let cursor = days.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (days.has(cursor)) { streak++; cursor = shiftDay(cursor, -1); }

  const row = db.prepare('SELECT ayahs FROM daily_log WHERE user_id = ? AND day = ?').get(req.user.id, today);
  res.json({ ...prefs, today_ayahs: row ? row.ayahs : 0, streak });
});

router.put('/', auth, (req, res) => {
  const { last_page, daily_goal } = req.body;
  const page = Number.isInteger(last_page) && last_page >= 1 && last_page <= 604 ? last_page : null;
  const goal = Number.isInteger(daily_goal) && daily_goal >= 1 && daily_goal <= 500 ? daily_goal : null;
  db.prepare(`
    INSERT INTO user_prefs (user_id, last_page, daily_goal) VALUES (?, COALESCE(?, 1), COALESCE(?, 5))
    ON CONFLICT(user_id) DO UPDATE SET
      last_page  = COALESCE(?, last_page),
      daily_goal = COALESCE(?, daily_goal)
  `).run(req.user.id, page, goal, page, goal);
  res.json({ success: true });
});

module.exports = router;
