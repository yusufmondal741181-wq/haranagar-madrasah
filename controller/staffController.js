const bcrypt = require('bcryptjs');
const db = require('../server/db');
const { logActivity } = require('../middleware/logger');

// Get all staff (Super Admin Only)
exports.getAllStaff = (req, res) => {
  try {
    const staff = db.prepare('SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY id DESC').all();
    return res.json({ staff });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load staff list.' });
  }
};

// Create Staff
exports.createStaff = (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());
    if (existing) {
      return res.status(400).json({ error: 'A staff member with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(password, salt);
    const assignedRole = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STAFF';

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, 'ACTIVE')
    `).run(name.trim(), email.trim(), passwordHash, assignedRole);

    logActivity(req.user.id, req.user.name, 'STAFF_CREATED', `Created new staff account: ${name} (${email}) with role ${assignedRole}`);

    return res.status(201).json({ message: 'Staff member created successfully.', staffId: result.lastInsertRowid });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create staff account.' });
  }
};

// Update Staff
exports.updateStaff = (req, res) => {
  try {
    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Staff account not found.' });
    }

    const { name, email, role, status } = req.body;

    // Check duplicate email
    const existing = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE AND id != ?').get(email.trim(), req.params.id);
    if (existing) {
      return res.status(400).json({ error: 'This email is already in use by another user.' });
    }

    // Safety: prevent disabling self
    if (req.user.id === targetUser.id && status === 'DISABLED') {
      return res.status(400).json({ error: 'You cannot disable your own active account.' });
    }

    db.prepare(`
      UPDATE users SET name = ?, email = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name.trim(), email.trim(), role || targetUser.role, status || targetUser.status, req.params.id);

    logActivity(req.user.id, req.user.name, 'STAFF_UPDATED', `Updated staff account info for ${name} (${email})`);

    return res.json({ message: 'Staff member updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update staff account.' });
  }
};

// Reset Staff Password
exports.resetPassword = (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Staff user not found.' });
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(new_password, salt);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, req.params.id);

    logActivity(req.user.id, req.user.name, 'STAFF_PASSWORD_RESET', `Reset password for staff user ${targetUser.name}`);

    return res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
};

// Delete Staff
exports.deleteStaff = (req, res) => {
  try {
    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Staff user not found.' });
    }

    if (req.user.id === targetUser.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

    logActivity(req.user.id, req.user.name, 'STAFF_DELETED', `Deleted staff user: ${targetUser.name} (${targetUser.email})`);

    return res.json({ message: 'Staff member deleted.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete staff user.' });
  }
};