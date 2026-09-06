const db = require('../server/db');
const { logActivity } = require('../middleware/logger');

// Get Settings (Public)
exports.getSettings = (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    return res.json({ settings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load institutional settings.' });
  }
};

// Update Settings (Super Admin Only)
exports.updateSettings = (req, res) => {
  try {
    const updateStmt = db.prepare(`
      INSERT INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    const updateTx = db.transaction((settingsObj) => {
      for (const [key, value] of Object.entries(settingsObj)) {
        updateStmt.run(key, String(value));
      }
    });

    updateTx(req.body);

    logActivity(req.user.id, req.user.name, 'SETTINGS_UPDATED', 'Updated institutional website settings');

    return res.json({ message: 'Institutional settings updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save settings.' });
  }
};