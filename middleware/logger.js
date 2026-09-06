const db = require('../server/db');

function logActivity(userId, userName, action, description, ipAddress = '') {
  try {
    const stmt = db.prepare(`
      INSERT INTO activity_logs (user_id, user_name, action, description, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(userId, userName, action, description, ipAddress);
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
}

module.exports = { logActivity };