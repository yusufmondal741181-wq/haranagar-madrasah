const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../server/db');
const { JWT_SECRET } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email/username and password.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Your account is disabled. Please contact the Super Admin.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    logActivity(user.id, user.name, 'LOGIN', `Staff user ${user.name} logged into the system.`, clientIp);

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server authentication error.' });
  }
};

exports.getMe = (req, res) => {
  return res.json({ user: req.user });
};

exports.logout = (req, res) => {
  if (req.user) {
    logActivity(req.user.id, req.user.name, 'LOGOUT', `Staff user ${req.user.name} logged out.`);
  }
  return res.json({ message: 'Logged out successfully.' });
};
// Change Password
exports.changePassword = (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Please provide current and new password.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long.'
      });
    }

    const user = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }

    const isMatch = bcrypt.compareSync(
      current_password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        error: 'Current password is incorrect.'
      });
    }

    const newPasswordHash = bcrypt.hashSync(new_password, 10);

    db.prepare(
      'UPDATE users SET password_hash = ? WHERE id = ?'
    ).run(newPasswordHash, req.user.id);

    logActivity(
      req.user.id,
      req.user.name,
      'PASSWORD_CHANGED',
      'User changed their password.'
    );

    return res.json({
      message: 'Password changed successfully.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      error: 'Failed to change password.'
    });
  }
};