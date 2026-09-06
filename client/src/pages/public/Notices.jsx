import React, { useEffect, useState } from 'react';
import { Calendar, Download, AlertCircle } from 'lucide-react';

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/notices')
      .then(res => res.json())
      .then(data => {
    setNotices(data.notices || []);
    setLoading(false);
})
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <h2 className="institution-brand" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
        Official Notice Board
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Verified announcements, circulars, and schedules published by Haranagar Chandipur Senior Madrasah.
      </p>

      {loading ? (
        <p>Loading notices...</p>
      ) : notices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>There are currently no active public notices.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {notices.map(notice => (
            <div key={notice.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <h3 style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>{notice.title}</h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  <Calendar size={14} /> Published: {notice.publish_date}
                </span>
              </div>
              <p style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                {notice.content}
              </p>
              {notice.attachment && (
                <div>
                  <a
                    href={`/uploads/public/${notice.attachment}`}
                    download
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Download size={15} /> Download Attached Circular
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}