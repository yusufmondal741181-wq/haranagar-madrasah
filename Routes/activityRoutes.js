const express = require('express');
const router = express.Router();
const activityCtrl = require('../controller/activityController');
const { authenticateToken, requireStaffOrAdmin } = require('../middleware/auth');

router.get('/logs', authenticateToken, requireStaffOrAdmin, activityCtrl.getActivityLogs);
router.get('/dashboard-stats', authenticateToken, requireStaffOrAdmin, activityCtrl.getDashboardStats);

module.exports = router;