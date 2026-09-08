import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, Bell, FileText, UserCheck, Clock } from 'lucide-react';

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState({
  metrics: {
    totalStudents: 0,
    totalStaff: 0,
    totalNotices: 0,
    totalDocuments: 0
  }
});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(console.error);
  }, [token]);

  if (loading || !data) return <div>Loading dashboard statistics...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Administrative Dashboard</h2>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', borderRadius: '6px' }}>
            <Users size={28} color="#0284c7" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Students</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{data.metrics.totalStudents}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
            <Bell size={28} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notices Published</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{data.metrics.totalNotices}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', borderRadius: '6px' }}>
            <FileText size={28} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Documents Uploaded</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{data.metrics.totalDocuments}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#f3e8ff', borderRadius: '6px' }}>
            <UserCheck size={28} color="#9333ea" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Authorized Staff</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{data.metrics.totalStaff}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Students */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Recent Student Enrollments</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.recentStudents || []).map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.student_id}</td>
                    <td>{s.name}</td>
                    <td>Class {s.class} ({s.section || 'A'})</td>
                    <td><span className="badge badge-success">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Recent System Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
           {(data.recentActivities || []).map(act => (
              <div key={act.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{act.user_name || 'System / Visitor'}</span>
                  <span>{act.created_at}</span>
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  <strong style={{ color: 'var(--primary)' }}>{act.action}: </strong>
                  {act.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}