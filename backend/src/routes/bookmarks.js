const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(rows);
});

router.post('/', auth, (req, res) => {
  const { surah_number, ayah_number, note } = req.body;
  const exists = db.prepare('SELECT id FROM bookmarks WHERE user_id=? AND surah_number=? AND ayah_number=?')
    .get(req.user.id, surah_number, ayah_number);
  if (exists) return res.status(409).json({ message: 'Already bookmarked' });

  const result = db.prepare('INSERT INTO bookmarks (user_id, surah_number, ayah_number, note) VALUES (?,?,?,?)')
    .run(req.user.id, surah_number, ayah_number, note || null);
  res.json({ id: result.lastInsertRowid, surah_number, ayah_number, note });
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM bookmarks WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

module.exports = router;
