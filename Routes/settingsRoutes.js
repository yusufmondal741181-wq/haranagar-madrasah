const express = require('express');
const router = express.Router();
const settingsCtrl = require('../controller/settingsController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

router.get('/', settingsCtrl.getSettings);
router.put('/', authenticateToken, requireSuperAdmin, settingsCtrl.updateSettings);

module.exports = router;