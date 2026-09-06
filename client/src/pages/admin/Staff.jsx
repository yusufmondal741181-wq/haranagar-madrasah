import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserPlus, KeyRound, Ban, CheckCircle } from 'lucide-react';

export default function Staff() {
  const { token, user } = useContext(AuthContext);
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STAFF');

  const fetchStaff = async () => {
    const res = await fetch('/api/staff', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
     setStaffss(data.documents || []);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, email, password, role })
    });

    if (res.ok) {
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchStaff();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create staff member');
    }
  };

  const toggleStatus = async (s) => {
    const nextStatus = s.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const res = await fetch(`/api/staff/${s.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) fetchStaff();
  };

  const handleResetPassword = async (id, staffName) => {
    const newPassword = prompt(`Enter new password for ${staffName} (min 8 characters):`);
    if (!newPassword) return;

    const res = await fetch(`/api/staff/${id}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ newPassword })
    });

    if (res.ok) {
      alert(`Password successfully changed for ${staffName}`);
    } else {
      const err = await res.json();
      alert(err.error || 'Password reset failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Staff & Administrator Accounts</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Super Admin exclusive management console</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          <UserPlus size={15} /> Add Staff Account
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Official Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Created</th>
                <th>Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.email}</td>
                  <td>
                    <span className={`badge ${s.role === 'SUPER_ADMIN' ? 'badge-warning' : 'badge-secondary'}`}>
                      {s.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>{s.created_at.split(' ')[0]}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleResetPassword(s.id, s.name)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        title="Reset Password"
                      >
                        <KeyRound size={14} />
                      </button>
                      {s.id !== user.id && (
                        <button
                          onClick={() => toggleStatus(s)}
                          className={s.status === 'ACTIVE' ? 'btn btn-danger' : 'btn btn-secondary'}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          title={s.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}
                        >
                          {s.status === 'ACTIVE' ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                      )}
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
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>Add Authorized Staff</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Staff Full Name *</label>
                <input type="text" required className="form-control" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Official Email *</label>
                <input type="email" required className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Temporary Password *</label>
                <input type="password" required minLength={8} className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Assigned Permission Role *</label>
                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="STAFF">STAFF (Manage Students, Notices, Documents)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Administrative Rights)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}