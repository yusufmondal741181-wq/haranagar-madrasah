import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserPlus, Search, Download, Trash2, Edit2, Upload } from 'lucide-react';

export default function Students() {
  const { token } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [className, setClassName] = useState('');
  const [session, setSession] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [form, setForm] = useState({
    student_id: '',
    name: '',
    father_name: '',
    mother_name: '',
    guardian_name: '',
    date_of_birth: '',
    gender: 'Male',
    class: 'V',
    section: 'A',
    roll_number: '',
    admission_number: '',
    admission_date: '',
    address: '',
    phone: '',
    academic_session: '2026',
    status: 'Active'
  });

 const fetchStudents = async () => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (className) params.append('student_class', className);
  if (session) params.append('academic_session', session);

  const apiBase = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://haranagar-madrasah.onrender.com';

 const res = await fetch(`${apiBase}/api/students?${params.toString()}&_=${Date.now()}`, {
  headers: { Authorization: `Bearer ${token}` }
});

if (res.ok) {
  const data = await res.json();
  setStudents(data.students || []);
}
    
  
}
  useEffect(() => {
    fetchStudents();
  }, [search, className, session]);

 const handleSave = async (e) => {
  e.preventDefault();

  const apiBase = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://haranagar-madrasah.onrender.com';

  const url = editingStudent
    ? `${apiBase}/api/students/${editingStudent.id}`
    : `${apiBase}/api/students`;

  const method = editingStudent ? 'PUT' : 'POST';

  try {
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value ?? '');
    });

    if (photo) {
      formData.append('photo', photo);
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingStudent(null);
      setPhoto(null);
      fetchStudents();
    } else {
      const err = await res.json();
      alert(err.error || 'Operation failed');
    }
  } catch (error) {
    console.error('Save student error:', error);
    alert('Failed to save student.');
  }
};
const handleUDISEImport = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setImporting(true);
  setImportResult(null);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const apiBase =
      window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://haranagar-madrasah.onrender.com';

    const res = await fetch(`${apiBase}/api/students/import/udise`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'UDISE import failed.');
      return;
    }

    setImportResult(data.summary);

    alert(
      `Import completed.\n\nImported: ${data.summary.imported}\nSkipped: ${data.summary.skipped}\nInvalid: ${data.summary.invalid}`
    );

    fetchStudents();

  } catch (error) {
    console.error('UDISE import error:', error);
    alert('Failed to import UDISE Excel file.');
  } finally {
    setImporting(false);
    e.target.value = '';
  }
};
const handleDelete = async (id, name) => {
  if (
    !window.confirm(
      `Are you sure you want to permanently delete student record: ${name}?`
    )
  ) return;

  try {
    const apiBase =
      window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://haranagar-madrasah.onrender.com';

    const res = await fetch(`${apiBase}/api/students/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      fetchStudents();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete student.');
    }
  } catch (error) {
    console.error('Delete student error:', error);
    alert('Failed to delete student.');
  }
};


  const openAddModal = () => {
    setEditingStudent(null);
    setPhoto(null);
    setForm({
      student_id: `STU-${Date.now().toString().slice(-4)}`,
      name: '',
      father_name: '',
      mother_name: '',
      guardian_name: '',
      date_of_birth: '',
      gender: 'Male',
      class: 'V',
      section: 'A',
      roll_number: '',
      admission_number: '',
      admission_date: new Date().toISOString().split('T')[0],
      address: '',
      phone: '',
      academic_session: '2026',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

 const openEditModal = (s) => {
  setEditingStudent(s);
  setPhoto(null);
  setForm({ ...s });
  setIsModalOpen(true);
};



const handleViewStudent = async (id) => {
  try {
    const apiBase =
      window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://haranagar-madrasah.onrender.com';

    const res = await fetch(`${apiBase}/api/students/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to load student details.');
    }

    setSelectedStudent(data.student);
    setIsDetailsModalOpen(true);

  } catch (error) {
    console.error('Student details error:', error);
    alert(error.message);
  }
};



  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Student Registry Management</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
  onClick={async () => {
    try {
      const token = localStorage.getItem('token');

      const apiBase = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://haranagar-madrasah.onrender.com';

const response = await fetch(`${apiBase}/api/students/export`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

      if (!response.ok) {
        throw new Error('Failed to export students.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'students_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export students.');
    }
  }}
  className="btn btn-secondary"
  style={{ fontSize: '0.85rem' }}
>
  <Download size={15} /> Export CSV
  <label
  className="btn btn-secondary"
  style={{
    fontSize: '0.85rem',
    cursor: importing ? 'not-allowed' : 'pointer',
    opacity: importing ? 0.6 : 1
  }}
>
  <Upload size={15} />
  {importing ? 'Importing...' : 'Import UDISE Excel'}

  <input
    type="file"
    accept=".xlsx,.xls"
    onChange={handleUDISEImport}
    disabled={importing}
    style={{ display: 'none' }}
  />
</label>
</button>
          <button onClick={openAddModal} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <UserPlus size={15} /> Add New Student
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by student name, ID, or Roll..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div>
                  <select
            className="form-control"
            value={className}
            onChange={e => setClassName(e.target.value)}
          >
            <option value="">All Classes</option>

            {[ 'PP','I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="text"
            className="form-control"
            placeholder="Session (e.g. 2026)"
            value={session}
            onChange={e => setSession(e.target.value)}
          />
        </div>
      </div>

      {/* Student Records Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>PEN</th>
                <th>Name</th>
                <th>Father's Name</th>
                <th>Class / Sec</th>
                <th>Roll No</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No student records found matching filters.
                  </td>
                </tr>
              ) : (
                students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleViewStudent(s.id)}
                        style={{
                          border: 'none',
                          background: 'none',
                          padding: 0,
                          color: 'var(--primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {s.student_id}
                      </button>
                    </td>
                    <td>{s.pen || 'N/A'}</td>
                    <td>{s.name}</td>
                    <td>{s.father_name || 'N/A'}</td>
                    <td>Class {s.class} ({s.section || 'A'})</td>
                    <td>{s.roll_number || 'N/A'}</td>
                    <td>{s.phone || 'N/A'}</td>
                    <td>
                      <span
                      className={`badge ${
                        s.status === 'Active'
                          ? 'badge-success'
                          : 'badge-danger'
                                     }`}
>                              {s.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => openEditModal(s)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.name)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Student Details Modal */}
{isDetailsModalOpen && selectedStudent && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}
  >
    <div
      className="card"
      style={{
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}
    >
      <h3
        style={{
          marginBottom: '1.25rem',
          color: 'var(--primary)'
        }}
      >
        Student Details
      </h3>

      {/* Photo + Basic Information */}
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          marginBottom: '1.5rem',
          alignItems: 'flex-start'
        }}
      >
        {/* Photo */}
        <div style={{ minWidth: '150px', textAlign: 'center' }}>
          {selectedStudent.photo ? (
            <img
              src={`${
                window.location.hostname === 'localhost'
                  ? 'http://localhost:5000'
                  : 'https://haranagar-madrasah.onrender.com'
              }/uploads/public/photos/${selectedStudent.photo}`}
              alt={selectedStudent.name}
              style={{
                width: '150px',
                height: '180px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
          ) : (
            <div
              style={{
                width: '150px',
                height: '180px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888'
              }}
            >
              No Photo
            </div>
          )}
        </div>

        {/* Basic Details */}
        <div style={{ flex: 1 }}>
          <p><strong>Student ID:</strong> {selectedStudent.student_id || 'N/A'}</p>
          <p><strong>Name:</strong> {selectedStudent.name || 'N/A'}</p>
          <p><strong>Father's Name:</strong> {selectedStudent.father_name || 'N/A'}</p>
          <p><strong>Mother's Name:</strong> {selectedStudent.mother_name || 'N/A'}</p>
          <p><strong>Guardian Name:</strong> {selectedStudent.guardian_name || 'N/A'}</p>
          <p><strong>Date of Birth:</strong> {selectedStudent.date_of_birth || 'N/A'}</p>
          <p><strong>Gender:</strong> {selectedStudent.gender || 'N/A'}</p>
        </div>
      </div>

      {/* Academic Details */}
      <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
        Academic Details
      </h4>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.8rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <strong>Class:</strong> {selectedStudent.class || 'N/A'}
        </div>

        <div>
          <strong>Section:</strong> {selectedStudent.section || 'N/A'}
        </div>

        <div>
          <strong>Roll Number:</strong> {selectedStudent.roll_number || 'N/A'}
        </div>

        <div>
          <strong>Admission Number:</strong> {selectedStudent.admission_number || 'N/A'}
        </div>

        <div>
          <strong>Admission Date:</strong> {selectedStudent.admission_date || 'N/A'}
        </div>

        <div>
          <strong>Academic Session:</strong> {selectedStudent.academic_session || 'N/A'}
        </div>

        <div>
          <strong>Status:</strong> {selectedStudent.status || 'N/A'}
        </div>
      </div>

      {/* Contact Details */}
      <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
        Contact Details
      </h4>

      <div style={{ marginBottom: '1.5rem' }}>
        <p>
          <strong>Phone:</strong> {selectedStudent.phone || 'N/A'}
        </p>

        <p>
          <strong>Address:</strong> {selectedStudent.address || 'N/A'}
        </p>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setIsDetailsModalOpen(false);
            setSelectedStudent(null);
          }}
        >
          Close
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setIsDetailsModalOpen(false);
            openEditModal(selectedStudent);
          }}c
        >
          Edit Student
        </button>
      </div>
    </div>
  </div>
)}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>
              {editingStudent ? `Edit Student: ${editingStudent.name}` : 'Register New Student'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Student ID *</label>
                  <input type="text" required className="form-control" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" required className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Father's Name</label>
                  <input type="text" className="form-control" value={form.father_name} onChange={e => setForm({ ...form, father_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Mother's Name</label>
                  <input type="text" className="form-control" value={form.mother_name} onChange={e => setForm({ ...form, mother_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Class *</label>
                  <select className="form-control" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                   {[ 'PP','I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map(c => (
                                <option key={c} value={c}>Class {c}</option>
                              ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <input type="text" className="form-control" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Roll Number</label>
                  <input type="text" className="form-control" value={form.roll_number} onChange={e => setForm({ ...form, roll_number: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Admission No</label>
                  <input type="text" className="form-control" value={form.admission_number} onChange={e => setForm({ ...form, admission_number: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Academic Session *</label>
                  <input type="text" required className="form-control" value={form.academic_session} onChange={e => setForm({ ...form, academic_session: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input type="text" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div><div className="form-group">
                 <label>Student Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={e => setPhoto(e.target.files[0])}
                  />
                </div>
                 <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                   <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  <option value="Passed">Passed</option>
                  <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Residential Address</label>
                <textarea rows={2} className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? 'Save Changes' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}