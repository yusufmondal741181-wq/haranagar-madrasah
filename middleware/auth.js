const jwt = require('jsonwebtoken');
const db = require('../server/db');
const pg = require('../server/postgresDb');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_random_jwt_secret_key_change_in_production_966';

// Verify JWT and authenticate user
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Access token required. Please sign in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user still exists and is ACTIVE
    const result = await pg.query(
      'SELECT id, name, email, role, status FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: 'User account no longer exists.'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error('Authentication error:', err);

    return res.status(403).json({
      error: 'Invalid or expired session token.'
    });
  }
}

// Role Authorization Middleware
function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied: Requires SUPER_ADMIN privileges.' });
  }
  next();
}

function requireStaffOrAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'STAFF')) {
    return res.status(403).json({ error: 'Access denied: Insufficient staff permissions.' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireSuperAdmin,
  requireStaffOrAdmin,
  JWT_SECRET
};