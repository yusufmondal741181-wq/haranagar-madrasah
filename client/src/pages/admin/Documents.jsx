import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Upload, Trash2, Download, Lock, Globe } from 'lucide-react';

const CATEGORIES = [
  'Academic Documents',
  'Admission Documents',
  'Examination Documents',
  'Administrative Documents',
  'Forms',
  'Other Documents'
];

export default function Documents() {
  const { token } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academic Documents');
  const [description, setDescription] = useState('');
  const [session, setSession] = useState('2026');
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState(null);

  const fetchDocuments = async () => {
   const res = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
     setDocuments(data.documents || []);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select a file to upload');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('academic_session', session);
    formData.append('is_public', isPublic ? '1' : '0');
    formData.append('document', file);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchDocuments();
    } else {
      const err = await res.json();
      alert(err.error || 'Document upload error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete document "${title}" permanently?`)) return;
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchDocuments();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Official Document Management</h2>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          <Upload size={15} /> Upload Official Document
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Privacy Level</th>
                <th>Uploader</th>
                <th>Uploaded Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.title}</td>
                  <td>{d.category}</td>
                  <td>
                    {d.is_public === 1 ? (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Globe size={12} /> PUBLIC
                      </span>
                    ) : (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} /> PRIVATE (STAFF ONLY)
                      </span>
                    )}
                  </td>
                  <td>{d.uploader_name || 'Staff'}</td>
                  <td>{d.created_at.split(' ')[0]}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a
                       href={`${import.meta.env.VITE_API_URL}/documents/download/${d.id}`}
                        download
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        <Download size={14} />
                      </a>
                      <button
                        onClick={() => handleDelete(d.id, d.title)}
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>Upload Document</h3>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Document Title *</label>
                <input type="text" required className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Session / Year</label>
                <input type="text" className="form-control" value={session} onChange={e => setSession(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Privacy & Access Control *</label>
                <select className="form-control" value={isPublic ? '1' : '0'} onChange={e => setIsPublic(e.target.value === '1')}>
                  <option value="1">Public (Visible and downloadable by public visitors)</option>
                  <option value="0">Private / Confidential (Restricted to logged-in staff)</option>
                </select>
              </div>
              <div className="form-group">
                <label>File (PDF, Word, Excel, Images - max 15MB) *</label>
                <input type="file" required className="form-control" onChange={e => setFile(e.target.files[0])} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}