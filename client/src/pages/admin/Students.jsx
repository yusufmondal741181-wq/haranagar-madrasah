import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserPlus, Search, Download, Trash2, Edit2 } from 'lucide-react';

export default function Students() {
  const { token } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [className, setClassName] = useState('');
  const [session, setSession] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

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
    if (className) params.append('className', className);
    if (session) params.append('academicSession', session);

    const res = await fetch(`/api/students?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setStudents(data.students || []);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, className, session]);

  const handleSave = async (e) => {
    e.preventDefault();
    const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
    const method = editingStudent ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } else {
      const err = await res.json();
      alert(err.error || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete student record: ${name}?`)) return;

    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchStudents();
  };

  const openAddModal = () => {
    setEditingStudent(null);
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
    setForm({ ...s });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Student Registry Management</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href="/api/students/export/csv"
            className="btn btn-secondary"
            download
            style={{ fontSize: '0.85rem' }}
          >
            <Download size={15} /> Export CSV
          </a>
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
          <select className="form-control" value={className} onChange={e => setClassName(e.target.value)}>
            <option value="">All Classes</option>
            {['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'].map(c => (
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
                    <td style={{ fontWeight: 600 }}>{s.student_id}</td>
                    <td>{s.name}</td>
                    <td>{s.father_name || 'N/A'}</td>
                    <td>Class {s.class} ({s.section || 'A'})</td>
                    <td>{s.roll_number || 'N/A'}</td>
                    <td>{s.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {s.status}
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
                    {['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'].map(c => (
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
                    <option value="Others">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Transferred">Tranasferred</option>
                    <option value="Passed out">Passed out</option>
                    <option value="Suspended">Suspended</option>
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