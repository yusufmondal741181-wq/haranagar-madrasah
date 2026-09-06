const express = require('express');
const router = express.Router();
const noticeCtrl = require('../controller/noticeController');
const docCtrl = require('../controller/documentController');
const settingsCtrl = require('../controller/settingsController');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Optional auth checker for downloading documents
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      // Ignore invalid token on public routes
    }
  }
  next();
}

router.get('/settings', settingsCtrl.getSettings);
router.get('/notices', noticeCtrl.getPublicNotices);
router.get('/documents', docCtrl.getPublicDocuments);
router.get('/documents/download/:id', optionalAuth, docCtrl.downloadDocument);

module.exports = router;