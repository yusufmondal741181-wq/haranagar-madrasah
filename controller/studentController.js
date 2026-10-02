const pg = require('../server/postgresDb');
const { logActivity } = require('../middleware/logger');

// Get Students with Search & Filters
exports.getStudents = async (req, res) => {
  try {
    const { search, student_class, section, academic_session, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

   let query = 'SELECT * FROM students WHERE 1=1';
let countQuery = 'SELECT COUNT(*)::int AS total FROM students WHERE 1=1';

const params = [];
const countParams = [];
let paramIndex = 1;

if (search) {
  const term = `%${search.trim()}%`;

  query += `
    AND (
      name ILIKE $${paramIndex}
      OR student_id ILIKE $${paramIndex}
      OR admission_number ILIKE $${paramIndex}
      OR roll_number::text ILIKE $${paramIndex}
    )
  `;

  countQuery += `
    AND (
      name ILIKE $${paramIndex}
      OR student_id ILIKE $${paramIndex}
      OR admission_number ILIKE $${paramIndex}
      OR roll_number::text ILIKE $${paramIndex}
    )
  `;

  params.push(term);
  countParams.push(term);
  paramIndex++;
}

if (student_class) {
  query += ` AND class = $${paramIndex}`;
  countQuery += ` AND class = $${paramIndex}`;

  params.push(student_class);
  countParams.push(student_class);
  paramIndex++;
}

if (section) {
  query += ` AND section = $${paramIndex}`;
  countQuery += ` AND section = $${paramIndex}`;

  params.push(section);
  countParams.push(section);
  paramIndex++;
}

if (academic_session) {
  query += ` AND academic_session = $${paramIndex}`;
  countQuery += ` AND academic_session = $${paramIndex}`;

  params.push(academic_session);
  countParams.push(academic_session);
  paramIndex++;
}

if (status) {
  query += ` AND status = $${paramIndex}`;
  countQuery += ` AND status = $${paramIndex}`;

  params.push(status);
  countParams.push(status);
  paramIndex++;
}

const limitValue = parseInt(limit, 10);
const offsetValue = (parseInt(page, 10) - 1) * limitValue;

query += ` ORDER BY id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

params.push(limitValue, offsetValue);

const studentsResult = await pg.query(query, params);
const countResult = await pg.query(countQuery, countParams);

const students = studentsResult.rows;
const totalCount = countResult.rows[0].total;

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
exports.getStudentById = async (req, res) => {
  try {
    const result = await pg.query(
  'SELECT * FROM students WHERE id = $1',
  [req.params.id]
);

const student = result.rows[0];
    if (!student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }
    return res.json({ student });
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving student.' });
  }
};

// Create Student
exports.createStudent = async (req, res) => {
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
   const existingResult = await pg.query(
  `
  SELECT id
  FROM students
  WHERE student_id = $1
     OR admission_number = $2
  `,
  [student_id.trim(), admission_number.trim()]
);

if (existingResult.rows.length > 0) {
  return res.status(400).json({
    error: 'A student with this Student ID or Admission Number already exists.'
  });
}

    const photoFilename = req.file ? req.file.filename : null;

   const result = await pg.query(
  `
  INSERT INTO students (
    student_id,
    name,
    father_name,
    mother_name,
    guardian_name,
    date_of_birth,
    gender,
    class,
    section,
    roll_number,
    admission_number,
    admission_date,
    address,
    phone,
    academic_session,
    photo,
    status
  )
  VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10,
    $11, $12, $13, $14, $15,
    $16, $17
  )
  RETURNING id
  `,
  [
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
  ]
);

const studentId = result.rows[0].id;




    logActivity(req.user.id, req.user.name, 'STUDENT_ADDED', `Enrolled new student: ${name} (ID: ${student_id})`);

return res.status(201).json({
  message: 'Student registered successfully.',
  studentId
});
  } catch (error) {
    console.error('createStudent error:', error);
    return res.status(500).json({ error: 'Failed to create student record: ' + error.message });
  }
};

// Update Student
exports.updateStudent = async (req, res) => {
  try {
    const studentResult = await pg.query(
  'SELECT * FROM students WHERE id = $1',
  [req.params.id]
);

const student = studentResult.rows[0];
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const {
      student_id, name, father_name, mother_name, guardian_name,
      date_of_birth, gender, class: studentClass, section, roll_number,
      admission_number, admission_date, address, phone, academic_session, status
    } = req.body;

    // Check duplicate student_id or admission_number with different row id
    const existingResult = await pg.query(
  `
  SELECT id
  FROM students
  WHERE (student_id = $1 OR admission_number = $2)
    AND id != $3
  `,
  [
    student_id.trim(),
    admission_number.trim(),
    req.params.id
  ]
);

const existing = existingResult.rows[0];
    if (existing) {
      return res.status(400).json({ error: 'Another student already uses this Student ID or Admission Number.' });
    }

    const photoFilename = req.file ? req.file.filename : student.photo;

    await pg.query(
  `
  UPDATE students SET
    student_id = $1,
    name = $2,
    father_name = $3,
    mother_name = $4,
    guardian_name = $5,
    date_of_birth = $6,
    gender = $7,
    class = $8,
    section = $9,
    roll_number = $10,
    admission_number = $11,
    admission_date = $12,
    address = $13,
    phone = $14,
    academic_session = $15,
    photo = $16,
    status = $17,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $18
  `,
  [
    student_id.trim(),
    name.trim(),
    father_name.trim(),
    mother_name || '',
    guardian_name || '',
    date_of_birth,
    gender,
    studentClass,
    section,
    parseInt(roll_number, 10),
    admission_number.trim(),
    admission_date,
    address,
    phone,
    academic_session,
    photoFilename,
    status,
    req.params.id
  ]
);

    logActivity(req.user.id, req.user.name, 'STUDENT_UPDATED', `Updated details for student: ${name} (ID: ${student_id})`);

    return res.json({ message: 'Student updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update student: ' + error.message });
  }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const studentResult = await pg.query(
  'SELECT * FROM students WHERE id = $1',
  [req.params.id]
);

const student = studentResult.rows[0];
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

   await pg.query(
  'DELETE FROM students WHERE id = $1',
  [req.params.id]
);
    logActivity(req.user.id, req.user.name, 'STUDENT_DELETED', `Deleted student: ${student.name} (ID: ${student.student_id})`);

    return res.json({ message: 'Student record deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete student record.' });
  }
};

// Export Students (CSV or JSON)
exports.exportStudents = async (req, res) => {
  try {
   const result = await pg.query(`
  SELECT
    student_id,
    name,
    father_name,
    class,
    section,
    roll_number,
    admission_number,
    phone,
    status
  FROM students
  ORDER BY id DESC
`);

const students = result.rows;
    
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