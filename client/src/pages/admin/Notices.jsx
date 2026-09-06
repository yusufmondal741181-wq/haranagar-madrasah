import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Trash2, Globe, EyeOff } from 'lucide-react';

export default function Notices() {
  const { token } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPublished, setIsPublished] = useState(true);
  const [file, setFile] = useState(null);

  const fetchNotices = async () => {
    const res = await fetch('/api/notices', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setNotices(data.notices);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [token]);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('publish_date', publishDate);
    formData.append('published', isPublished ? 1 : 0);
    if (file) formData.append('attachment', file);

    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setFile(null);
      fetchNotices();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create notice');
    }
  };

  const handleTogglePublish = async (id) => {
    const res = await fetch(`/api/notices/${id}/toggle-publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchNotices();
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete notice "${title}" permanently?`)) return;
    const res = await fetch(`/api/notices/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchNotices();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Notice Management</h2>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          <Plus size={15} /> Create Notice
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Publication Date</th>
                <th>Creator</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.map(n => (
                <tr key={n.id}>
                  <td style={{ fontWeight: 600 }}>{n.title}</td>
                  <td>{n.publish_date}</td>
                  <td>{n.creator_name || 'Administrator'}</td>
                  <td>
                    <span className={`badge ${n.published === 1 ? 'badge-success' : 'badge-warning'}`}>
                      {n.published === 1 ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleTogglePublish(n.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        title={n.published === 1 ? 'Unpublish' : 'Publish'}
                      >
                        {n.published === 1 ? <EyeOff size={14} /> : <Globe size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(n.id, n.title)}
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
          <div className="card" style={{ width: '100%', maxWidth: '550px' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>Publish Institutional Notice</h3>
            <form onSubmit={handleCreateNotice}>
              <div className="form-group">
                <label>Notice Title *</label>
                <input type="text" required className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Notice Content *</label>
                <textarea rows={4} required className="form-control" value={content} onChange={e => setContent(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Publish Date</label>
                  <input type="date" className="form-control" value={publishDate} onChange={e => setPublishDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={isPublished ? '1' : '0'} onChange={e => setIsPublished(e.target.value === '1')}>
                    <option value="1">Publish to Public Board</option>
                    <option value="0">Save as Internal Draft</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Attachment (PDF or Image, max 15MB)</label>
                <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}