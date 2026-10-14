import React, { useState } from 'react';
import { authApi } from '../services/api';
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ResetPassword = ({ token: propToken, onResetSuccess, onNavigateToLogin }) => {
  const [token, setToken] = useState(propToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ token, newPassword });
      if (res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Password reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '480px' }}>
      <div className="glass-panel" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'var(--grad-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 16px rgba(225, 29, 72, 0.4)',
          }}>
            <Lock size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>Reset Password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Choose a strong new password for your account.
          </p>
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

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={32} color="#34d399" />
            </div>
            <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Password Reset Complete</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Your account password has been updated. You can now log in with your new credentials.
            </p>
            <button
              onClick={onNavigateToLogin}
              className="btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              <span>Proceed to Sign In</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Reset Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="form-input"
                placeholder="Token from reset email link"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Re-enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
