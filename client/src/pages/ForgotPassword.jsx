import React, { useState } from 'react';
import { authApi } from '../services/api';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const ForgotPassword = ({ onNavigateToLogin, onNavigateToReset }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err) {
      setError(err.message || 'Failed to process request.');
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
            <KeyRound size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>Forgot Password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Enter your registered email address and we'll send a secure password reset link.
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

        {message && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '13.5px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
              <CheckCircle2 size={16} />
              <span>Reset Email Dispatched</span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{message}</p>

            {resetToken && (
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Sandbox Testing Link:
                </div>
                <button
                  onClick={() => onNavigateToReset(resetToken)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '13px' }}
                >
                  <span>Proceed to Reset Form</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Registered Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="customer@slicecraft.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          <button
            onClick={onNavigateToLogin}
            style={{ background: 'transparent', color: 'var(--text-muted)' }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
