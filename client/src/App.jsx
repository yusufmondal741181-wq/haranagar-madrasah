import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/public/About';
import Notices from './pages/public/Notices';
import Documents from './pages/public/Documents';
import Students from './pages/admin/Students';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminNotices from './pages/admin/Notices';
import AdminDocuments from './pages/admin/Documents';
import Staff from './pages/admin/Staff';
import ActivityLogs from './pages/admin/ActivityLogs';
import Settings from './pages/admin/Setting';

function PublicLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
    console.log("APP IS RUNNING");
  return (
    
    <Routes>
      {/* Public institutional routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/students" element={<Students />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<Login />} />
      </Route>

      {/* Protected Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="staff" element={<Staff />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
    
  );
}