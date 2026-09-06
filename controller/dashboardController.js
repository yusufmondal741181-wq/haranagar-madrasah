const db = require('../server/db');

// Get Dashboard Overview
exports.getOverview = (req, res) => {
  try {
    const totalStudents = db
      .prepare('SELECT COUNT(*) AS count FROM students')
      .get().count;

    const totalStaff = db
      .prepare('SELECT COUNT(*) AS count FROM users')
      .get().count;

    const totalNotices = db
      .prepare('SELECT COUNT(*) AS count FROM notices')
      .get().count;

    const totalDocuments = db
      .prepare('SELECT COUNT(*) AS count FROM documents')
      .get().count;
      const recentStudents = db.prepare(`
       SELECT id, student_id, name, class, section, status
      FROM students
      ORDER BY id DESC
      LIMIT 5
      `).all();
      

const recentActivities = db.prepare(`
  SELECT id, user_name, action, description, created_at
  FROM activity_logs
  ORDER BY id DESC
  LIMIT 5
`).all();

    return res.json({
  metrics: {
    totalStudents,
    totalStaff,
    totalNotices,
    totalDocuments
  },
  recentStudents,
  recentActivities
  
});
  } catch (error) {i
    console.error('Dashboard overview error:', error);

    return res.status(500).json({
      error: 'Failed to load dashboard statistics.'
    });
  }
};