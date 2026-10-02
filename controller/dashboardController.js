const pg = require('../server/postgresDb');

// Get Dashboard Overview
exports.getOverview = async (req, res) => {
  try {
   const studentsResult = await pg.query(
  'SELECT COUNT(*)::int AS count FROM students'
);

const staffResult = await pg.query(
  'SELECT COUNT(*)::int AS count FROM users'
);

const noticesResult = await pg.query(
  'SELECT COUNT(*)::int AS count FROM notices'
);

const documentsResult = await pg.query(
  'SELECT COUNT(*)::int AS count FROM documents'
);

const totalStudents = studentsResult.rows[0].count;
const totalStaff = staffResult.rows[0].count;
const totalNotices = noticesResult.rows[0].count;
const totalDocuments = documentsResult.rows[0].count;
      const recentStudentsResult = await pg.query(`
  SELECT id, student_id, name, class, section, status
  FROM students
  ORDER BY id DESC
  LIMIT 5
`);

const recentStudents = recentStudentsResult.rows;
      
const recentActivitiesResult = await pg.query(`
  SELECT id, user_name, action, description, created_at
  FROM activity_logs
  ORDER BY id DESC
  LIMIT 5
`);

const recentActivities = recentActivitiesResult.rows;

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
  } catch (error) {
    console.error('Dashboard overview error:', error);

    return res.status(500).json({
      error: 'Failed to load dashboard statistics.'
    });
  }
};
// Get Activity Logs
// Get Activity Logs
exports.getActivityLogs = async (req, res) => {
  try {
    const result = await pg.query(`
      SELECT
        id,
        user_name,
        action,
        description,
        created_at
      FROM activity_logs
      ORDER BY id DESC
      LIMIT 100
    `);

    return res.json(result.rows);

  } catch (error) {
    console.error('Activity logs error:', error);

    return res.status(500).json({
      error: 'Failed to load activity logs.'
    });
  }
};