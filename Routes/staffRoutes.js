const express = require('express');
const router = express.Router();
const staffCtrl = require('../controller/staffController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

router.use(authenticateToken, requireSuperAdmin);

router.get('/', staffCtrl.getAllStaff);
router.post('/', staffCtrl.createStaff);
router.put('/:id', staffCtrl.updateStaff);
router.patch('/:id/reset-password', staffCtrl.resetPassword);
router.delete('/:id', staffCtrl.deleteStaff);

module.exports = router;