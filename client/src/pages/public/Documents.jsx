import React, { useEffect, useState } from 'react';
import { FileText, Download, Filter } from 'lucide-react';

const CATEGORIES = [
  'All Documents',
  'Academic Documents',
  'Admission Documents',
  'Examination Documents',
  'Administrative Documents',
  'Forms',
  'Other Documents'
];

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Documents');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory === 'All Documents'
      ? '/api/public/documents'
      : `/api/public/documents?category=${encodeURIComponent(selectedCategory)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedCategory]);

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <h2 className="institution-brand" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
        Institutional Documents Repository
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Download verified curriculum documents, forms, and administrative circulars.
      </p>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading documents repository...</p>
      ) : documents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No public documents cataloged in this category.</p>
        </div>
      ) : (
        <div className="table-responsive card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>Session</th>
                <th>Format</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{doc.title}</div>
                    {doc.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.description}</div>}
                  </td>
                  <td>{doc.category}</td>
                  <td>{doc.academic_session || 'Current'}</td>
                  <td><span className="badge badge-warning">{doc.file_type}</span></td>
                  <td>
                    <a
                     href={`/api/documents/download/${doc.id}`}
                      download
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <Download size={14} /> Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}