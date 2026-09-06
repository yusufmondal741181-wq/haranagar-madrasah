import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--primary-dark)', color: '#94a3b8', paddingTop: '3rem', paddingBottom: '1.5rem', marginTop: '4rem', borderTop: '4px solid var(--accent)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        <div>
          <h3 className="institution-brand" style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            Haranagar Chandipur Senior Madrasah
          </h3>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
            A premier educational institution established in 1966, dedicated to scholastic excellence, moral elevation, and progressive development.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '0.75rem' }}>Quick Navigation</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><Link to="/about">About the Madrasah</Link></li>
            <li><Link to="/notices">Official Announcements</Link></li>
            <li><Link to="/documents">Institutional Documents</Link></li>
            <li><Link to="/contact">Reach Office</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '0.75rem' }}>Administrative Access</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Authorized staff and administrative personnel only:
          </p>
          <Link to="/admin/login" className="btn" style={{ backgroundColor: 'var(--accent)', color: '#000', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            Admin Portal
          </Link>
        </div>
      </div>

      <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
        <p>&copy; {new Date().getFullYear()} Haranagar Chandipur Senior Madrasah (Est. 1966). All Rights Reserved.</p>
      </div>
    </footer>
  );
}