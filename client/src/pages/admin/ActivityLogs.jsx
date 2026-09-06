import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function ActivityLogs() {
  const { token } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('/api/dashboard/activity-logs', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setLogs)
      .catch(console.error);
  }, [token]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <ShieldCheck size={24} color="var(--primary)" />
        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Security & System Activity Logs</h2>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action Type</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{log.created_at}</td>
                  <td>{log.user_name ? `${log.user_name} (${log.user_email})` : 'Public Visitor / System'}</td>
                  <td>
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}