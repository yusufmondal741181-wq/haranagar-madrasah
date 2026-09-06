import React, { useContext } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Bell,
  FileText,
  UserCheck,
  History,
  Settings,
  LogOut
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading system security...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="institution-brand" style={{ fontSize: '1rem', color: 'white', margin: 0 }}>
            Haranagar Chandipur Senior Madrasah
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-light)' }}>Est. 1966 | Admin Portal</span>
        </div>

        <nav style={{ flex: 1, paddingTop: '1rem' }}>
          <NavLink to="/admin/dashboard"><LayoutDashboard size={18} /> Dashboard</NavLink>
          <NavLink to="/admin/students"><Users size={18} /> Students</NavLink>
          <NavLink to="/admin/notices"><Bell size={18} /> Notices</NavLink>
          <NavLink to="/admin/documents"><FileText size={18} /> Documents</NavLink>
          {user.role === 'SUPER_ADMIN' && (
            <NavLink to="/admin/staff"><UserCheck size={18} /> Staff Management</NavLink>
          )}
          {user.role === 'SUPER_ADMIN' && (
            <NavLink to="/admin/activity-logs"><History size={18} /> Activity Logs</NavLink>
          )}
          <NavLink to="/admin/settings"><Settings size={18} /> Settings</NavLink>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={logout}
            className="btn"
            style={{ width: '100%', backgroundColor: '#dc2626', color: 'white', justifyContent: 'center' }}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Signed in as</span>
            <strong style={{ marginLeft: '0.5rem' }}>{user.name} ({user.role})</strong>
          </div>
          <div>
            <a href="/" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              View Public Website
            </a>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}