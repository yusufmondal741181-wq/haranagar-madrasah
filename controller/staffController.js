const bcrypt = require('bcryptjs');
const pg = require('../server/postgresDb');
const { logActivity } = require('../middleware/logger');

// Get all staff (Super Admin Only)
exports.getAllStaff = async (req, res) => {
  try {
   const result = await pg.query(`
  SELECT id, name, email, role, status, created_at, updated_at
  FROM users
  ORDER BY id DESC
`);

const staff = result.rows;
    return res.json({ staff });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load staff list.' });
  }
};

// Create Staff
  exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

   const existingResult = await pg.query(
  'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
  [email.trim()]
);

if (existingResult.rows.length > 0) {
  return res.status(400).json({
    error: 'A staff member with this email address already exists.'
  });
}
    

    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(password, salt);
    const assignedRole = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STAFF';

    const result = await pg.query(
  `
  INSERT INTO users (name, email, password_hash, role, status)
  VALUES ($1, $2, $3, $4, 'ACTIVE')
  RETURNING id
  `,
  [
    name.trim(),
    email.trim(),
    passwordHash,
    assignedRole
  ]
);

const staffId = result.rows[0].id;

    logActivity(req.user.id, req.user.name, 'STAFF_CREATED', `Created new staff account: ${name} (${email}) with role ${assignedRole}`);

  return res.status(201).json({
  message: 'Staff member created successfully.',
  staffId
});
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create staff account.' });
  }
};

// Update Staff
  exports.updateStaff = async (req, res) => {
  try {
    const targetResult = await pg.query(
  'SELECT * FROM users WHERE id = $1',
  [req.params.id]
);

const targetUser = targetResult.rows[0];

if (!targetUser) {
  return res.status(404).json({
    error: 'Staff account not found.'
  });
}

    const { name, email, role, status } = req.body;

    // Check duplicate email
   const existingResult = await pg.query(
  `
  SELECT id
  FROM users
  WHERE LOWER(email) = LOWER($1)
    AND id != $2
  `,
  [email.trim(), req.params.id]
);

if (existingResult.rows.length > 0) {
  return res.status(400).json({
    error: 'This email is already in use by another user.'
  });
}
   

    // Safety: prevent disabling self
    if (req.user.id === targetUser.id && status === 'DISABLED') {
      return res.status(400).json({ error: 'You cannot disable your own active account.' });
    }

    await pg.query(
  `
  UPDATE users
  SET
    name = $1,
    email = $2,
    role = $3,
    status = $4,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $5
  `,
  [
    name.trim(),
    email.trim(),
    role || targetUser.role,
    status || targetUser.status,
    req.params.id
  ]
);

    logActivity(req.user.id, req.user.name, 'STAFF_UPDATED', `Updated staff account info for ${name} (${email})`);

    return res.json({ message: 'Staff member updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update staff account.' });
  }
};

// Reset Staff Password
exports.resetPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const targetResult = await pg.query(
  'SELECT * FROM users WHERE id = $1',
  [req.params.id]
);

const targetUser = targetResult.rows[0];

if (!targetUser) {
  return res.status(404).json({
    error: 'Staff user not found.'
  });
}

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(new_password, salt);

    await pg.query(
  `
  UPDATE users
  SET password_hash = $1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = $2
  `,
  [hash, req.params.id]
);

    logActivity(req.user.id, req.user.name, 'STAFF_PASSWORD_RESET', `Reset password for staff user ${targetUser.name}`);

    return res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
};

// Delete Staff
exports.deleteStaff = async (req, res) => {
  try {
    const targetResult = await pg.query(
  'SELECT * FROM users WHERE id = $1',
  [req.params.id]
);

const targetUser = targetResult.rows[0];

if (!targetUser) {
  return res.status(404).json({
    error: 'Staff user not found.'
  });
}
    if (req.user.id === targetUser.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

   await pg.query(
  'DELETE FROM users WHERE id = $1',
  [req.params.id]
);

    logActivity(req.user.id, req.user.name, 'STAFF_DELETED', `Deleted staff user: ${targetUser.name} (${targetUser.email})`);

    return res.json({ message: 'Staff member deleted.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete staff user.' });
  }
};