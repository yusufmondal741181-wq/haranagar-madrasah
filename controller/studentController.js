const db = require('../server/db');;
const { logActivity } = require('../middleware/logger');

// Get Students with Search & Filters
exports.getStudents = (req, res) => {
  try {
    const { search, student_class, section, academic_session, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = 'SELECT * FROM students WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM students WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search) {
      const searchCondition = ` AND (name LIKE ? OR student_id LIKE ? OR admission_number LIKE ? OR roll_number LIKE ?)`;
      const term = `%${search.trim()}%`;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(term, term, term, term);
      countParams.push(term, term, term, term);
    }

    if (student_class) {
      query += ' AND class = ?';
      countQuery += ' AND class = ?';
      params.push(student_class);
      countParams.push(student_class);
    }

    if (section) {
      query += ' AND section = ?';
      countQuery += ' AND section = ?';
      params.push(section);
      countParams.push(section);
    }

    if (academic_session) {
      query += ' AND academic_session = ?';
      countQuery += ' AND academic_session = ?';
      params.push(academic_session);
      countParams.push(academic_session);
    }

    if (status) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), offset);

    const students = db.prepare(query).all(...params);
    const totalCount = db.prepare(countQuery).get(...countParams).total;

    return res.json({
      students,
      total: totalCount,
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / parseInt(limit, 10))
    });
  } catch (error) {
    console.error('getStudents error:', error);
    return res.status(500).json({ error: 'Failed to fetch student records.' });
  }
};

// Get single student by ID
exports.getStudentById = (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }
    return res.json({ student });
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving student.' });
  }
};

// Create Student
exports.createStudent = (req, res) => {
  try {
    const {
      student_id, name, father_name, mother_name, guardian_name,
      date_of_birth, gender, class: studentClass, section, roll_number,
      admission_number, admission_date, address, phone, academic_session, status
    } = req.body;

    if (!student_id || !name || !father_name || !studentClass || !roll_number || !admission_number || !phone) {
      return res.status(400).json({ error: 'Please provide all mandatory student fields.' });
    }

    // Check duplicate student_id or admission_number
    const existing = db.prepare('SELECT id FROM students WHERE student_id = ? OR admission_number = ?').get(student_id.trim(), admission_number.trim());
    if (existing) {
      return res.status(400).json({ error: 'A student with this Student ID or Admission Number already exists.' });
    }

    const photoFilename = req.file ? req.file.filename : null;

    const stmt = db.prepare(`
      INSERT INTO students (
        student_id, name, father_name, mother_name, guardian_name,
        date_of_birth, gender, class, section, roll_number,
        admission_number, admission_date, address, phone, academic_session,
        photo, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      student_id.trim(),
      name.trim(),
      father_name.trim(),
      mother_name || '',
      guardian_name || '',
      date_of_birth,
      gender || 'Male',
      studentClass,
      section || 'A',
      parseInt(roll_number, 10),
      admission_number.trim(),
      admission_date,
      address,
      phone,
      academic_session || '2026-2027',
      photoFilename,
      status || 'Active'
    );

    logActivity(req.user.id, req.user.name, 'STUDENT_ADDED', `Enrolled new student: ${name} (ID: ${student_id})`);

    return res.status(201).json({ message: 'Student registered successfully.', studentId: result.lastInsertRowid });
  } catch (error) {
    console.error('createStudent error:', error);
    return res.status(500).json({ error: 'Failed to create student record: ' + error.message });
  }
};

// Update Student
exports.updateStudent = (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const {
      student_id, name, father_name, mother_name, guardian_name,
      date_of_birth, gender, class: studentClass, section, roll_number,
      admission_number, admission_date, address, phone, academic_session, status
    } = req.body;

    // Check duplicate student_id or admission_number with different row id
    const existing = db.prepare('SELECT id FROM students WHERE (student_id = ? OR admission_number = ?) AND id != ?')
      .get(student_id.trim(), admission_number.trim(), req.params.id);
    if (existing) {
      return res.status(400).json({ error: 'Another student already uses this Student ID or Admission Number.' });
    }

    const photoFilename = req.file ? req.file.filename : student.photo;

    db.prepare(`
      UPDATE students SET
        student_id = ?, name = ?, father_name = ?, mother_name = ?, guardian_name = ?,
        date_of_birth = ?, gender = ?, class = ?, section = ?, roll_number = ?,
        admission_number = ?, admission_date = ?, address = ?, phone = ?, academic_session = ?,
        photo = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      student_id.trim(), name.trim(), father_name.trim(), mother_name || '', guardian_name || '',
      date_of_birth, gender, studentClass, section, parseInt(roll_number, 10),
      admission_number.trim(), admission_date, address, phone, academic_session,
      photoFilename, status, req.params.id
    );

    logActivity(req.user.id, req.user.name, 'STUDENT_UPDATED', `Updated details for student: ${name} (ID: ${student_id})`);

    return res.json({ message: 'Student updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update student: ' + error.message });
  }
};

// Delete Student
exports.deleteStudent = (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, req.user.name, 'STUDENT_DELETED', `Deleted student: ${student.name} (ID: ${student.student_id})`);

    return res.json({ message: 'Student record deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete student record.' });
  }
};

// Export Students (CSV or JSON)
exports.exportStudents = (req, res) => {
  try {
    const students = db.prepare('SELECT student_id, name, father_name, class, section, roll_number, admission_number, phone, status FROM students').all();
    
    // Format as CSV
    const headers = ['Student ID', 'Name', 'Father Name', 'Class', 'Section', 'Roll Number', 'Admission Number', 'Phone', 'Status'];
    const rows = students.map(s => [
      `"${s.student_id}"`,
      `"${s.name}"`,
      `"${s.father_name}"`,
      `"${s.class}"`,
      `"${s.section}"`,
      s.roll_number,
      `"${s.admission_number}"`,
      `"${s.phone}"`,
      `"${s.status}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate export file.' });
  }
};