import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export const Login = ({ onNavigateToRegister, onNavigateToForgot, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('customer@slicecraft.com');
    setPassword('User@12345');
    setError(null);
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
            <LogIn size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Sign in to track orders & save custom pizza recipes.
          </p>
        </div>

        {/* Quick Demo Credentials Autofill Pill */}
        <div
          onClick={fillDemoCustomer}
          style={{
            background: 'rgba(249, 115, 22, 0.12)',
            border: '1px dashed rgba(249, 115, 22, 0.4)',
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
            <Sparkles size={16} color="var(--accent-primary)" />
            <span>Click to fill <strong>Demo Customer</strong> credentials</span>
          </div>
          <span className="badge badge-warning" style={{ fontSize: '10px' }}>Instant Fill</span>
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
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={onNavigateToForgot}
                style={{ background: 'transparent', color: 'var(--accent-primary)', fontSize: '12px', fontWeight: '600' }}
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '8px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button
            onClick={onNavigateToRegister}
            style={{ background: 'transparent', color: 'var(--accent-primary)', fontWeight: '600' }}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
