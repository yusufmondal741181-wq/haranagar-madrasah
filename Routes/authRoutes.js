const express = require('express');
const router = express.Router();
const authCtrl = require('../controller/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', authCtrl.login);
router.get('/me', authenticateToken, authCtrl.getMe);
router.post('/logout', authenticateToken, authCtrl.logout);
router.put('/change-password', authenticateToken, authCtrl.changePassword);

module.exports = router;