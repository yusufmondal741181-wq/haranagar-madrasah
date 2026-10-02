const pg = require('../server/postgresDb');
const { logActivity } = require('../middleware/logger');

// Public Notices
exports.getPublicNotices = async (req, res) => {
  try {
    const result = await pg.query(`
      SELECT
        id,
        title,
        content,
        attachment,
        attachment_original_name,
        publish_date
      FROM notices
      WHERE published = 1
      ORDER BY publish_date DESC, id DESC
    `);

    return res.json({ notices: result.rows });
  } catch (error) {
    console.error('getPublicNotices error:', error);
    return res.status(500).json({
      error: 'Failed to fetch public notices.'
    });
  }
};

// Admin Get All Notices
exports.getAllNotices = async (req, res) => {
  try {
    const result = await pg.query(`
      SELECT
        n.*,
        u.name AS author_name
      FROM notices n
      LEFT JOIN users u ON n.created_by = u.id
      ORDER BY n.id DESC
    `);

    return res.json({ notices: result.rows });
  } catch (error) {
    console.error('getAllNotices error:', error);

    return res.status(500).json({
      error: 'Failed to fetch notices.'
    });
  }
};

// Create Notice
exports.createNotice = async (req, res) => {
  try {
    const { title, content, publish_date, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Notice title and content are required.'
      });
    }

    const attachmentFilename = req.file ? req.file.filename : null;
    const originalName = req.file ? req.file.originalname : null;

    const isPub =
  published === '1' ||
  published === 1 ||
  published === 'true' ||
  published === true
    ? 1
    : 0;

    const result = await pg.query(
      `
      INSERT INTO notices (
        title,
        content,
        attachment,
        attachment_original_name,
        publish_date,
        published,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [
        title.trim(),
        content.trim(),
        attachmentFilename,
        originalName,
        publish_date || new Date().toISOString().split('T')[0],
        isPub,
        req.user.id
      ]
    );

    const noticeId = result.rows[0].id;

    logActivity(
      req.user.id,
      req.user.name,
      'NOTICE_CREATED',
      `Created notice: "${title}" (Published: ${isPub ? 'Yes' : 'No'})`
    );

    return res.status(201).json({
      message: 'Notice created successfully.',
      noticeId
    });

  } catch (error) {
    console.error('createNotice error:', error);

    return res.status(500).json({
      error: 'Failed to save notice: ' + error.message
    });
  }
};
// Update Notice
exports.updateNotice = async (req, res) => {
  try {
    const noticeResult = await pg.query(
      'SELECT * FROM notices WHERE id = $1',
      [req.params.id]
    );

    const notice = noticeResult.rows[0];

    if (!notice) {
      return res.status(404).json({
        error: 'Notice not found.'
      });
    }

    const { title, content, publish_date, published } = req.body;

    const attachmentFilename = req.file
      ? req.file.filename
      : notice.attachment;

    const originalName = req.file
      ? req.file.originalname
      : notice.attachment_original_name;

    const isPub =
  published === '1' ||
  published === 1 ||
  published === 'true' ||
  published === true
    ? 1
    : 0;

    await pg.query(
      `
      UPDATE notices SET
        title = $1,
        content = $2,
        attachment = $3,
        attachment_original_name = $4,
        publish_date = $5,
        published = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      `,
      [
        title.trim(),
        content.trim(),
        attachmentFilename,
        originalName,
        publish_date,
        isPub,
        req.params.id
      ]
    );

    logActivity(
      req.user.id,
      req.user.name,
      'NOTICE_UPDATED',
      `Updated notice: "${title}"`
    );

    return res.json({
      message: 'Notice updated successfully.'
    });

  } catch (error) {
    console.error('updateNotice error:', error);

    return res.status(500).json({
      error: 'Failed to update notice.'
    });
  }
};

// Toggle Publish Status
exports.togglePublishNotice = async (req, res) => {
  try {
    const noticeResult = await pg.query(
      'SELECT * FROM notices WHERE id = $1',
      [req.params.id]
    );

    const notice = noticeResult.rows[0];

    if (!notice) {
      return res.status(404).json({
        error: 'Notice not found.'
      });
    }

   const newStatus = notice.published === 1 ? 0 : 1;

    await pg.query(
      `
      UPDATE notices
      SET published = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [newStatus, req.params.id]
    );

    logActivity(
      req.user.id,
      req.user.name,
      newStatus ? 'NOTICE_PUBLISHED' : 'NOTICE_UNPUBLISHED',
      `Changed publication status of notice "${notice.title}" to ${
        newStatus ? 'Published' : 'Draft'
      }`
    );

    return res.json({
      message: `Notice status updated to ${
        newStatus ? 'Published' : 'Draft'
      }.`,
      published: newStatus
    });

  } catch (error) {
    console.error('togglePublishNotice error:', error);

    return res.status(500).json({
      error: 'Failed to update notice status.'
    });
  }
};

// Delete Notice
exports.deleteNotice = async (req, res) => {
  try {
    const noticeResult = await pg.query(
      'SELECT * FROM notices WHERE id = $1',
      [req.params.id]
    );

    const notice = noticeResult.rows[0];

    if (!notice) {
      return res.status(404).json({
        error: 'Notice not found.'
      });
    }

    await pg.query(
      'DELETE FROM notices WHERE id = $1',
      [req.params.id]
    );

    logActivity(
      req.user.id,
      req.user.name,
      'NOTICE_DELETED',
      `Deleted notice: "${notice.title}"`
    );

    return res.json({
      message: 'Notice deleted successfully.'
    });

  } catch (error) {
    console.error('deleteNotice error:', error);

    return res.status(500).json({
      error: 'Failed to delete notice.'
    });
  }
};