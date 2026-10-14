import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, Key, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLogin = ({ onLoginSuccess, onNavigateToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(email, password, adminKey);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Admin authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@slicecraft.com');
    setPassword('Admin@12345');
    setAdminKey('admin_secret_portal_key_secure_2026');
    setError(null);
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '480px' }}>
      <div className="glass-panel" style={{
        padding: '36px',
        border: '1px solid rgba(225, 29, 72, 0.4)',
        boxShadow: '0 0 30px rgba(225, 29, 72, 0.15)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #e11d48, #b91c1c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 16px rgba(225, 29, 72, 0.4)',
          }}>
            <ShieldCheck size={30} color="#fff" />
          </div>
          <div className="badge badge-danger" style={{ marginBottom: '8px' }}>
            Restricted Access
          </div>
          <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>Admin Command Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Separate management gateway for kitchen inventory & order dispatch.
          </p>
        </div>

        {/* Demo Admin Autofill Button */}
        <div
          onClick={fillDemoAdmin}
          style={{
            background: 'rgba(225, 29, 72, 0.1)',
            border: '1px dashed rgba(225, 29, 72, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#f43f5e" />
            <span>Click to fill <strong>Chief Admin</strong> credentials</span>
          </div>
          <span className="badge badge-danger" style={{ fontSize: '10px' }}>Auto-Fill</span>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="admin@slicecraft.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Security Portal Key (Optional)</label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="form-input"
              placeholder="admin_secret_portal_key_secure_2026"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', background: 'linear-gradient(135deg, #e11d48, #b91c1c)' }}
          >
            <span>{loading ? 'Authorizing Admin...' : 'Enter Admin Panel'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <button
            onClick={onNavigateToHome}
            style={{ background: 'transparent', color: 'var(--text-muted)' }}
          >
            Return to Customer Storefront
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
