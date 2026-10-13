const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const db = require('../db');

const userPublic = u => ({ id: u.id, name: u.name, email: u.email, avatar: u.avatar || null, created_at: u.created_at });

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  // Enhanced password validation
  if (password.length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  if (!/[A-Z]/.test(password))
    return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
  if (!/[a-z]/.test(password))
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
  if (!/[0-9]/.test(password))
    return res.status(400).json({ message: 'Password must contain at least one digit' });
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return res.status(400).json({ message: 'Password must contain at least one special character' });

  const hash = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hash);
    const user   = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token  = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: userPublic(user) });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: userPublic(user) });
});

/* ── Google OAuth ── */
router.post('/google', async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ message: 'Missing access token' });

  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!r.ok) return res.status(401).json({ message: 'Invalid Google token' });

    const { sub: googleId, email, name, picture } = await r.json();

    let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    if (!user) user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user) {
      if (!user.google_id) {
        db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(googleId, user.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      }
    } else {
      const pwd = bcrypt.hashSync(randomBytes(32).toString('hex'), 10);
      const result = db.prepare(
        'INSERT INTO users (name, email, password, avatar, google_id) VALUES (?, ?, ?, ?, ?)'
      ).run(name || email, email, pwd, picture || null, googleId);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: userPublic(user) });
  } catch (e) {
    // In production, use proper logger instead of console.error
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Update profile (name, password, avatar) ── */
router.put('/profile', (req, res) => {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });

  let payload;
  try { payload = jwt.verify(auth, process.env.JWT_SECRET); }
  catch { return res.status(401).json({ message: 'Invalid token' }); }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { name, currentPassword, newPassword, avatar } = req.body;
  const updatedName   = name?.trim() || user.name;
  const updatedAvatar = avatar !== undefined ? avatar : user.avatar;

  if (newPassword) {
    if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password))
      return res.status(401).json({ message: 'Current password is incorrect' });
    // Enhanced password validation for profile update
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!/[A-Z]/.test(newPassword))
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    if (!/[a-z]/.test(newPassword))
      return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
    if (!/[0-9]/.test(newPassword))
      return res.status(400).json({ message: 'Password must contain at least one digit' });
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword))
      return res.status(400).json({ message: 'Password must contain at least one special character' });
    db.prepare('UPDATE users SET name=?, password=?, avatar=? WHERE id=?')
      .run(updatedName, bcrypt.hashSync(newPassword, 10), updatedAvatar, payload.id);
  } else {
    db.prepare('UPDATE users SET name=?, avatar=? WHERE id=?')
      .run(updatedName, updatedAvatar, payload.id);
  }

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
  const token   = jwt.sign({ id: updated.id, name: updated.name, email: updated.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: userPublic(updated), token });
});

module.exports = router;
