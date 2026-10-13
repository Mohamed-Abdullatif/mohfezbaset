const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM downloads WHERE user_id = ?').all(req.user.id);
  res.json(rows);
});

router.post('/', auth, (req, res) => {
  const { surah_number, reciter } = req.body;
  try {
    db.prepare('INSERT OR IGNORE INTO downloads (user_id, surah_number, reciter) VALUES (?,?,?)')
      .run(req.user.id, surah_number, reciter);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Error saving download' });
  }
});

router.delete('/:surah/:reciter', auth, (req, res) => {
  db.prepare('DELETE FROM downloads WHERE user_id=? AND surah_number=? AND reciter=?')
    .run(req.user.id, req.params.surah, req.params.reciter);
  res.json({ success: true });
});

module.exports = router;
