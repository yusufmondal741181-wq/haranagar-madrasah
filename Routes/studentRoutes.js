const express = require('express');
const router = express.Router();
const studentCtrl = require('../controller/studentController');
const { authenticateToken, requireStaffOrAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticateToken, requireStaffOrAdmin);

router.get('/', studentCtrl.getStudents);
router.get('/export', studentCtrl.exportStudents);
router.get('/:id', studentCtrl.getStudentById);
router.post('/', upload.single('photo'), studentCtrl.createStudent);
router.put('/:id', upload.single('photo'), studentCtrl.updateStudent);
router.delete('/:id', studentCtrl.deleteStudent);

module.exports = router;