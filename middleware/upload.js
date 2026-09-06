const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Allowed extensions and MIME types
const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  // Documents
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      cb(null, path.join(__dirname, '../uploads/public/photos'));
    } else if (file.fieldname === 'attachment') {
      cb(null, path.join(__dirname, '../uploads/public/attachments'));
    } else if (file.fieldname === 'document') {
      // Check if document is flagged as private
      const isPublic = req.body.is_public === '0' || req.body.is_public === false || req.body.is_public === 'false' ? false : true;
      if (isPublic) {
        cb(null, path.join(__dirname, '../uploads/public/documents'));
      } else {
        cb(null, path.join(__dirname, '../uploads/private'));
      }
    } else {
      cb(null, path.join(__dirname, '../uploads/public/attachments'));
    }
  },
  filename: (req, file, cb) => {
    // Generate secure random unique filename preventing directory traversal & overwrite
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const isMimeAllowed = Object.keys(ALLOWED_MIME_TYPES).includes(file.mimetype);
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const isExtAllowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xls', 'xlsx'].includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Allowed types: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX.'));
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter
});

module.exports = upload;