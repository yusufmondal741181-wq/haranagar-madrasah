import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, FileText, BookOpen, Award, ArrowRight } from 'lucide-react';

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetch('/api/public/notices')
      .then(res => res.json())
      .then(data => setNotices(data.slice(0, 4)))
      .catch(console.error);

    fetch('/api/public/documents')
      .then(res => res.json())
      .then(data => setDocuments(data.slice(0, 4)))
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero Welcome Section */}
      <section style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '4.5rem 0', textAlign: 'center' }}>
        <div className="container">
          <span style={{ color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, fontSize: '0.85rem' }}>
            Official Institutional Portal
          </span>
          <h2 className="institution-brand" style={{ fontSize: '2.4rem', margin: '1rem 0 0.5rem 0' }}>
            Haranagar Chandipur Senior Madrasah
          </h2>
          <p style={{ fontSize: '1.1rem', maxWidth: '750px', margin: '0 auto 2rem auto', opacity: 0.9 }}>
            Nurturing knowledge, integrity, and disciplined scholarship since 1966.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/about" className="btn" style={{ backgroundColor: 'var(--accent)', color: '#000' }}>
              About Institution
            </Link>
            <Link to="/notices" className="btn btn-secondary">
              View Notices
            </Link>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Latest Notices */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Bell size={20} /> Latest Notices
              </h3>
              <Link to="/notices" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {notices.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No published notices at this moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notices.map(notice => (
                  <div key={notice.id} style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notice.publish_date}</span>
                    <h4 style={{ fontSize: '0.95rem', margin: '0.2rem 0' }}>{notice.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {notice.content.length > 100 ? notice.content.substring(0, 100) + '...' : notice.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>

          

        {/* Highlights */}
        <section style={{ marginTop: '3.5rem' }}>
          <h3 className="institution-brand" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.6rem', color: 'var(--primary)' }}>
            Institution Overview & Pillars
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <BookOpen size={36} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
              <h4>Academic Excellence</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Comprehensive syllabus adhering strictly to West Bengal Board and Senior Madrasah curriculum standards.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <Award size={36} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
              <h4>Heritage Since 1966</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Over five decades of moral character formation, academic dedication, and distinguished alumni achievements.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <FileText size={36} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
              <h4>Transparent Governance</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Clear access to official notices, curriculum forms, and verified records for students and guardians.
              </p>
            </div>
          </div>
        </section>
    </div>
    </div>
  );
}