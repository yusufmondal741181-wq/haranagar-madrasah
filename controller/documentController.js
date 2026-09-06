const path = require('path');
const fs = require('fs');
const db = require('../server/db');
const { logActivity } = require('../middleware/logger');

// Public Documents
exports.getPublicDocuments = (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT id, title, category, description, academic_session, file_name, created_at FROM documents WHERE is_public = 1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY id DESC';
    const documents = db.prepare(query).all(...params);
    return res.json({ documents });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch public documents.' });
  }
};

// Admin Get All Documents
exports.getAllDocuments = (req, res) => {
  try {
    const documents = db.prepare(`
      SELECT d.*, u.name as uploader_name 
      FROM documents d 
      LEFT JOIN users u ON d.uploaded_by = u.id 
      ORDER BY d.id DESC
    `).all();
    return res.json({ documents });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch documents.' });
  }
};

// Upload Document
exports.uploadDocument = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please choose a document file to upload.' });
    }

    const { title, category, description, academic_session, is_public } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required.' });
    }

    const isPublic = is_public === '1' || is_public === 1 || is_public === 'true' || is_public === true ? 1 : 0;
    const filePath = req.file.filename;

    const stmt = db.prepare(`
      INSERT INTO documents (
        title, category, description, academic_session,
        file_path, file_name, file_size, mime_type, is_public, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      category,
      description || '',
      academic_session || '2026-2027',
      filePath,
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
      isPublic,
      req.user.id
    );

    logActivity(req.user.id, req.user.name, 'DOCUMENT_UPLOADED', `Uploaded document: "${title}" (${isPublic ? 'Public' : 'Private'})`);

    return res.status(201).json({ message: 'Document uploaded successfully.', documentId: result.lastInsertRowid });
  } catch (error) {
    console.error('uploadDocument error:', error);
    return res.status(500).json({ error: 'Failed to upload document: ' + error.message });
  }
};

// Download / View Document (Protected Handler for Private Files)
exports.downloadDocument = (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // If private document, ensure user is authenticated
    if (doc.is_public === 0 && !req.user) {
      return res.status(403).json({ error: 'Access denied. Authentication required to download this confidential document.' });
    }

    const folder = doc.is_public === 1 ? '../uploads/public/documents' : '../uploads/private';
    const filePath = path.join(__dirname, folder, doc.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Requested file was not found on server.' });
    }

    return res.download(filePath, doc.file_name);
  } catch (error) {
    return res.status(500).json({ error: 'Error downloading file.' });
  }
};

// Delete Document
exports.deleteDocument = (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Attempt to unlink physical file
    const folder = doc.is_public === 1 ? '../uploads/public/documents' : '../uploads/private';
    const filePath = path.join(__dirname, folder, doc.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, req.user.name, 'DOCUMENT_DELETED', `Deleted document: "${doc.title}"`);

    return res.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete document.' });
  }
};