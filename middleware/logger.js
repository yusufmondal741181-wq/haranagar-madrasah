const pg = require('../server/postgresDb');

async function logActivity(
  userId,
  userName,
  action,
  description,
  ipAddress = ''
) {
  try {
    await pg.query(
      `
      INSERT INTO activity_logs
        (user_id, user_name, action, description, ip_address)
      VALUES
        ($1, $2, $3, $4, $5)
      `,
      [userId, userName, action, description, ipAddress]
    );
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
}

module.exports = { logActivity };