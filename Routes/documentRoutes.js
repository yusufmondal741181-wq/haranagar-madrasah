const express = require('express');
const router = express.Router();
const docCtrl = require('../controller/documentController');
const { authenticateToken, requireStaffOrAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticateToken, requireStaffOrAdmin);

router.get('/', docCtrl.getAllDocuments);
router.post('/', upload.single('document'), docCtrl.uploadDocument);
router.delete('/:id', docCtrl.deleteDocument);

module.exports = router