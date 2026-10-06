const XLSX = require('xlsx');
const pg = require('../server/postgresDb');
const { logActivity } = require('../middleware/logger');

// Import UDISE Excel
exports.importUDISEStudents = async (req, res) => {
  const client = await pg.connect();

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Please upload a UDISE Excel file.'
      });
    }

    // Read Excel file from memory
    const workbook = XLSX.read(req.file.buffer, {
      type: 'buffer'
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    /*
      UDISE file:
      Row 1-2 = introductory/header information
      Row 3   = actual column headers

      range: 2 means start reading from Excel row 3
    */
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      range: 2,
      defval: ''
    });

    if (!rows.length) {
      return res.status(400).json({
        error: 'No student data found in the Excel file.'
      });
    }

    // Required Excel columns
    const requiredColumns = [
      'Class',
      'Section',
      'Name',
      'Gender',
      'Student PEN',
      'Student State Code',
      'Father Name',
      'Mother Name',
      'Social Category',
      'Minority Group',
      'AADHAAR No.'
    ];

    const firstRow = rows[0];

    const missingColumns = requiredColumns.filter(
      column => !Object.prototype.hasOwnProperty.call(firstRow, column)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        error: 'Required Excel columns are missing.',
        missingColumns
      });
    }

    await client.query('BEGIN');

    let imported = 0;
    let skipped = 0;
    let invalid = 0;

    const skippedRows = [];

    for (const row of rows) {
      const pen = String(row['Student PEN'] || '').trim();

      // PEN is mandatory
      if (!pen) {
        invalid++;
        skippedRows.push({
          name: row['Name'] || '',
          reason: 'PEN is missing'
        });
        continue;
      }

      const name = String(row['Name'] || '').trim();

      if (!name) {
        invalid++;
        skippedRows.push({
          pen,
          reason: 'Student name is missing'
        });
        continue;
      }

      // Check whether PEN already exists
      const existingResult = await client.query(
        `
        SELECT id
        FROM students
        WHERE pen = $1
        LIMIT 1
        `,
        [pen]
      );

      if (existingResult.rows.length > 0) {
        skipped++;

        skippedRows.push({
          pen,
          name,
          reason: 'PEN already exists'
        });

        continue;
      }

      /*
        Insert into main students table.

        Fields not supplied by UDISE remain NULL:
        student_id
        guardian_name
        date_of_birth
        roll_number
        admission_number
        admission_date
        address
        phone
        academic_session
        photo
      */

      const studentResult = await client.query(
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
          status,
          pen
        )
        VALUES (
          NULL,
          $1,
          $2,
          $3,
          NULL,
          NULL,
          $4,
          $5,
          $6,
          NULL,
          NULL,
          NULL,
          NULL,
          NULL,
          NULL,
          NULL,
          'Active',
          $7
        )
        RETURNING id
        `,
        [
          name,
          String(row['Father Name'] || '').trim(),
          String(row['Mother Name'] || '').trim(),
          String(row['Gender'] || '').trim(),
          String(row['Class'] || '').trim(),
          String(row['Section'] || '').trim(),
          pen
        ]
      );

      const studentDbId = studentResult.rows[0].id;

      // Insert UDISE-specific information
      await client.query(
        `
        INSERT INTO student_udise_details (
          student_id,
          student_state_code,
          social_category,
          minority_group,
          aadhaar_no
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          studentDbId,
          String(row['Student State Code'] || '').trim(),
          String(row['Social Category'] || '').trim(),
          String(row['Minority Group'] || '').trim(),
          String(row['AADHAAR No.'] || '').trim()
        ]
      );

      imported++;
    }

    await client.query('COMMIT');

    // Activity log
    if (req.user) {
      await logActivity(
        req.user.id,
        req.user.name,
        'UDISE_STUDENT_IMPORT',
        `Imported ${imported} students from UDISE Excel. Skipped: ${skipped}. Invalid: ${invalid}.`
      );
    }

    return res.status(200).json({
      message: 'UDISE student import completed successfully.',
      summary: {
        totalRows: rows.length,
        imported,
        skipped,
        invalid
      },
      skippedRows
    });

  } catch (error) {
    await client.query('ROLLBACK');

    console.error('UDISE import error:', error);

    return res.status(500).json({
      error: 'Failed to import UDISE student data.',
      details: error.message
    });

  } finally {
    client.release();
  }
};