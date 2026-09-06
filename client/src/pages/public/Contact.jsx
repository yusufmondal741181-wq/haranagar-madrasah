import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', text: 'Submitting message...' });

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', text: data.message });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', text: data.error || 'Failed to submit' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Network connection failed' });
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <h2 className="institution-brand" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
        Contact the Madrasah Office
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
        Reach out to the administrative office of Haranagar Chandipur Senior Madrasah.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Institutional Contact Information */}
        <div className="card">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1.25rem' }}>Office Address & Details</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <MapPin size={20} color="var(--primary)" />
              <div>
                <strong>Physical Address:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Haranagar Chandipur Senior Madrasah<br />
                  Village: Haranagar, P.O. Chandipur<br />
                  West Bengal, India
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Phone size={20} color="var(--primary)" />
              <div>
                <strong>Telephone / Mobile:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>+91 033-XXXX-XXXX / +91 98XXX-XXXXX</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Mail size={20} color="var(--primary)" />
              <div>
                <strong>Official Email:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>office@haranagar-madrasah.edu.in</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Clock size={20} color="var(--primary)" />
              <div>
                <strong>Public Office Hours:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monday to Saturday: 10:30 AM – 4:30 PM</p>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div style={{ marginTop: '1.5rem', height: '180px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
            Map coordinates: Haranagar Chandipur Senior Madrasah Campus
          </div>
        </div>

        {/* Contact Form */}
        <div className="card">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1.25rem' }}>Send an Inquiry</h3>
          
          {status && (
            <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', fontSize: '0.85rem', backgroundColor: status.type === 'success' ? '#dcfce7' : status.type === 'error' ? '#fee2e2' : '#e0f2fe', color: status.type === 'success' ? '#15803d' : status.type === 'error' ? '#b91c1c' : '#0369a1' }}>
              {status.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Full Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                required
                className="form-control"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                className="form-control"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Inquiry Message *</label>
              <textarea
                rows={4}
                required
                className="form-control"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Send size={16} /> Send Message to Madrasah Office
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}