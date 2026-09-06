import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Save, Lock } from 'lucide-react';

export default function Settings() {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    institution_name: 'Haranagar Chandipur Senior Madrasah',
    established_year: '1966',
    official_email: '',
    contact_phone: '',
    address: '',
    description: '',
  });

  const [password, setPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();

        if (data.settings) {
          setForm((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      alert('Settings saved successfully.');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (password.new_password !== password.confirm_password) {
      alert('New password and confirm password do not match.');
      return;
    }

    if (password.new_password.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: password.current_password,
          new_password: password.new_password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      alert('Password changed successfully.');

      setPassword({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1000px' }}>
      <h1 style={{ color: '#176447', marginBottom: '30px' }}>
        Institution Settings
      </h1>

      {/* Institution Information */}
      <div
        style={{
          background: '#fff',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #dfe7e3',
          marginBottom: '25px',
        }}
      >
        <h2 style={{ color: '#176447', marginBottom: '20px' }}>
          Institution Information
        </h2>

        <form onSubmit={handleSaveSettings}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
            }}
          >
            <div>
              <label>Institution Name</label>
              <input
                className="form-control"
                name="institution_name"
                value={form.institution_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Established Year</label>
              <input
                className="form-control"
                name="established_year"
                value={form.established_year}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Official Email</label>
              <input
                className="form-control"
                type="email"
                name="official_email"
                value={form.official_email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Contact Phone</label>
              <input
                className="form-control"
                name="contact_phone"
                value={form.contact_phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label>Address</label>
            <input
              className="form-control"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label>Institution Description</label>
            <textarea
              className="form-control"
              name="description"
              rows="5"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '20px',
              background: '#176447',
              color: '#fff',
              border: 'none',
              padding: '12px 22px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            <Save size={18} style={{ verticalAlign: 'middle' }} />{' '}
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div
        style={{
          background: '#fff',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #dfe7e3',
        }}
      >
        <h2 style={{ color: '#176447', marginBottom: '20px' }}>
          <Lock size={20} style={{ verticalAlign: 'middle' }} /> Change Password
        </h2>

        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: '18px' }}>
            <label>Current Password</label>
            <input
              className="form-control"
              type="password"
              value={password.current_password}
              onChange={(e) =>
                setPassword({
                  ...password,
                  current_password: e.target.value,
                })
              }
              required
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label>New Password</label>
            <input
              className="form-control"
              type="password"
              value={password.new_password}
              onChange={(e) =>
                setPassword({
                  ...password,
                  new_password: e.target.value,
                })
              }
              required
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label>Confirm New Password</label>
            <input
              className="form-control"
              type="password"
              value={password.confirm_password}
              onChange={(e) =>
                setPassword({
                  ...password,
                  confirm_password: e.target.value,
                })
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            style={{
              background: '#176447',
              color: '#fff',
              border: 'none',
              padding: '12px 22px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}