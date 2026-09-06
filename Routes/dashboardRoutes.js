const express = require('express');
const router = express.Router();

const dashboardCtrl = require('../controller/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.get('/overview', authenticateToken, dashboardCtrl.getOverview);

module.exports = router;