import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { authApi, setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Loader, ArrowRight } from 'lucide-react';

export const VerifyEmail = ({ token: propToken, onVerificationSuccess, onNavigateToLogin }) => {
  const [token, setToken] = useState(propToken || '');
  const [status, setStatus] = useState('idle'); // idle | verifying | success | error
  const [message, setMessage] = useState('');
  const { setUser } = useAuth();

  const handleVerify = async (tokenToUse) => {
    const activeToken = tokenToUse || token;
    if (!activeToken) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    setStatus('verifying');
    try {
      const res = await authApi.verifyEmail(activeToken);
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
        if (res.token) {
          setAuthToken(res.token);
        }
        if (res.user) {
          setUser(res.user);
        }
        // Confetti celebration
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f59e0b'],
        });
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Verification link is invalid or expired.');
    }
  };

  useEffect(() => {
    if (propToken) {
      handleVerify(propToken);
    }
  }, [propToken]);

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '480px' }}>
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
        {status === 'verifying' && (
          <div>
            <div style={{ animation: 'spinSlow 2s linear infinite', display: 'inline-block', marginBottom: '16px' }}>
              <Loader size={40} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Verifying Email Address...</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Communicating with authorization server.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle2 size={36} color="#34d399" />
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              {message || 'Your account has been fully verified and activated.'}
            </p>
            <button
              onClick={onVerificationSuccess}
              className="btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              <span>Go to Pizza Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {(status === 'error' || status === 'idle') && (
          <div>
            {status === 'error' ? (
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <AlertCircle size={36} color="#f87171" />
              </div>
            ) : null}

            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
              {status === 'error' ? 'Verification Failed' : 'Verify Account Email'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              {message || 'Enter your verification token below or click the link received in your inbox.'}
            </p>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Verification Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="form-input"
                placeholder="Paste token here"
              />
            </div>

            <button
              onClick={() => handleVerify(token)}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', marginBottom: '16px' }}
            >
              <span>Submit Verification Token</span>
            </button>

            <button
              onClick={onNavigateToLogin}
              style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '14px' }}
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
