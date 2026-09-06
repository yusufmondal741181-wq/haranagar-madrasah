const db = require('../server/db');
exports.getActivityLogs = (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?').all(parseInt(limit, 10));
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch activity logs.' });
  }
};

exports.getDashboardStats = (req, res) => {
  try {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    const totalNotices = db.prepare('SELECT COUNT(*) as count FROM notices').get().count;
    const totalDocuments = db.prepare('SELECT COUNT(*) as count FROM documents').get().count;
    const totalStaff = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

    const recentStudents = db.prepare('SELECT id, student_id, name, class, section, status, created_at FROM students ORDER BY id DESC LIMIT 5').all();
    const recentNotices = db.prepare('SELECT id, title, publish_date, published FROM notices ORDER BY id DESC LIMIT 5').all();
    const recentDocuments = db.prepare('SELECT id, title, category, is_public, created_at FROM documents ORDER BY id DESC LIMIT 5').all();
    const recentActivities = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 6').all();

    return res.json({
      stats: {
        totalStudents,
        totalNotices,
        totalDocuments,
        totalStaff
      },
      recentStudents,
      recentNotices,
      recentDocuments,
      recentActivities
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
  }
};