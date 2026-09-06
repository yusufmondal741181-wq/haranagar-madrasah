const db = require('../server/db');
const { logActivity } = require('../middleware/logger');

// Public Notices
exports.getPublicNotices = (req, res) => {
  try {
    const notices = db.prepare(`
      SELECT id, title, content, attachment, attachment_original_name, publish_date 
      FROM notices 
      WHERE published = 1 
      ORDER BY publish_date DESC, id DESC
    `).all();
    return res.json({ notices });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch public notices.' });
  }
};

// Admin Get All Notices
exports.getAllNotices = (req, res) => {
  try {
    const notices = db.prepare(`
      SELECT n.*, u.name as author_name 
      FROM notices n 
      LEFT JOIN users u ON n.created_by = u.id 
      ORDER BY n.id DESC
    `).all();
    return res.json({ notices });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch notices.' });
  }
};

// Create Notice
exports.createNotice = (req, res) => {
  try {
    const { title, content, publish_date, published } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Notice title and content are required.' });
    }

    const attachmentFilename = req.file ? req.file.filename : null;
    const originalName = req.file ? req.file.originalname : null;
    const isPub = published === '1' || published === 1 || published === 'true' || published === true ? 1 : 0;

    const stmt = db.prepare(`
      INSERT INTO notices (title, content, attachment, attachment_original_name, publish_date, published, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      content.trim(),
      attachmentFilename,
      originalName,
      publish_date || new Date().toISOString().split('T')[0],
      isPub,
      req.user.id
    );

    logActivity(req.user.id, req.user.name, 'NOTICE_CREATED', `Created notice: "${title}" (Published: ${isPub ? 'Yes' : 'No'})`);

    return res.status(201).json({ message: 'Notice created successfully.', noticeId: result.lastInsertRowid });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save notice: ' + error.message });
  }
};

// Update Notice
exports.updateNotice = (req, res) => {
  try {
    const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found.' });
    }

    const { title, content, publish_date, published } = req.body;
    const attachmentFilename = req.file ? req.file.filename : notice.attachment;
    const originalName = req.file ? req.file.originalname : notice.attachment_original_name;
    const isPub = published === '1' || published === 1 || published === 'true' || published === true ? 1 : 0;

    db.prepare(`
      UPDATE notices SET 
        title = ?, content = ?, attachment = ?, attachment_original_name = ?, 
        publish_date = ?, published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title.trim(),
      content.trim(),
      attachmentFilename,
      originalName,
      publish_date,
      isPub,
      req.params.id
    );

    logActivity(req.user.id, req.user.name, 'NOTICE_UPDATED', `Updated notice: "${title}"`);

    return res.json({ message: 'Notice updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update notice.' });
  }
};

// Toggle Publish Status
exports.togglePublishNotice = (req, res) => {
  try {
    const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found.' });
    }

    const newStatus = notice.published === 1 ? 0 : 1;
    db.prepare('UPDATE notices SET published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, req.params.id);

    logActivity(req.user.id, req.user.name, newStatus ? 'NOTICE_PUBLISHED' : 'NOTICE_UNPUBLISHED', `Changed publication status of notice "${notice.title}" to ${newStatus ? 'Published' : 'Draft'}`);

    return res.json({ message: `Notice status updated to ${newStatus ? 'Published' : 'Draft'}.`, published: newStatus });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update notice status.' });
  }
};

// Delete Notice
exports.deleteNotice = (req, res) => {
  try {
    const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found.' });
    }

    db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, req.user.name, 'NOTICE_DELETED', `Deleted notice: "${notice.title}"`);

    return res.json({ message: 'Notice deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete notice.' });
  }
};