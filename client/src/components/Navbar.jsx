import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Lock } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  return (
    <header>
      {/* Top Banner */}
      <div style={{ backgroundColor: 'var(--primary-dark)', color: 'white', padding: '1.25rem 0', borderBottom: '3px solid var(--accent)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h1 className="institution-brand" style={{ fontSize: '1.85rem', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>
            Haranagar Chandipur Senior Madrasah
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--accent-light)', marginTop: '4px', fontWeight: 500 }}>
            Established in 1966
          </p>
        </div>
      </div>

      {/* Navigation bar */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <Link to="/" style={{ padding: '1rem 0.9rem', fontWeight: 600, fontSize: '0.9rem', borderBottom: isActive('/') ? '3px solid var(--primary)' : '3px solid transparent', color: isActive('/') ? 'var(--primary)' : 'var(--text-main)' }}>Home</Link>
            <Link to="/about" style={{ padding: '1rem 0.9rem', fontWeight: 600, fontSize: '0.9rem', borderBottom: isActive('/about') ? '3px solid var(--primary)' : '3px solid transparent', color: isActive('/about') ? 'var(--primary)' : 'var(--text-main)' }}>About Us</Link>
            <Link to="/notices" style={{ padding: '1rem 0.9rem', fontWeight: 600, fontSize: '0.9rem', borderBottom: isActive('/notices') ? '3px solid var(--primary)' : '3px solid transparent', color: isActive('/notices') ? 'var(--primary)' : 'var(--text-main)' }}>Notices</Link>
            <Link to="/contact" style={{ padding: '1rem 0.9rem', fontWeight: 600, fontSize: '0.9rem', borderBottom: isActive('/contact') ? '3px solid var(--primary)' : '3px solid transparent', color: isActive('/contact') ? 'var(--primary)' : 'var(--text-main)' }}>Contact</Link>
          </div>

          <div>
            {user ? (
              <Link to="/admin/dashboard" className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} /> Admin Panel
              </Link>
            ) : (
              <Link to="/admin/login" className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                <Lock size={15} /> Admin Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}