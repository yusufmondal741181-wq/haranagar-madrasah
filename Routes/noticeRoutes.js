const express = require('express');
const router = express.Router();
const noticeCtrl = require('../controller/noticeController');
const { authenticateToken, requireStaffOrAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticateToken, requireStaffOrAdmin);

router.get('/', noticeCtrl.getAllNotices);
router.post('/', upload.single('attachment'), noticeCtrl.createNotice);
router.put('/:id', upload.single('attachment'), noticeCtrl.updateNotice);
router.patch('/:id/toggle', noticeCtrl.togglePublishNotice);
router.delete('/:id', noticeCtrl.deleteNotice);

module.exports = router;