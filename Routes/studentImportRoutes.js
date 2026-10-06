const express = require('express');
const router = express.Router();

const { importUDISEStudents } = require('../controller/studentImportController');
const { authenticateToken } = require('../middleware/auth');
const udiseUpload = require('../middleware/udiseUpload');

router.post(
  '/udise',
  authenticateToken,
  udiseUpload.single('file'),
  importUDISEStudents
);

module.exports = router;