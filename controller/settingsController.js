const pg = require('../server/postgresDb');
const { logActivity } = require('../middleware/logger');

// Get Settings (Public)
exports.getSettings = async (req, res) => {
  try {
    const result = await pg.query(
  'SELECT key, value FROM settings'
);

const settings = {};

result.rows.forEach(r => {
  settings[r.key] = r.value;
});
    return res.json({ settings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load institutional settings.' });
  }
};

// Update Settings (Super Admin Only)
  exports.updateSettings = async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
  await pg.query(
    `
    INSERT INTO settings (key, value, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (key)
    DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = CURRENT_TIMESTAMP
    `,
    [key, String(value)]
  );
}

    logActivity(req.user.id, req.user.name, 'SETTINGS_UPDATED', 'Updated institutional website settings');

    return res.json({ message: 'Institutional settings updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save settings.' });
  }
};