import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const Register = ({ onNavigateToLogin, onNavigateToVerify }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res.success && res.data) {
        setRegistrationData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (registrationData) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '520px' }}>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
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
            <Mail size={32} color="#34d399" />
          </div>

          <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>Verify Your Email</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
            We've sent a verification link to <strong style={{ color: '#fff' }}>{registrationData.email}</strong>.
            Please verify your email address to unlock your account.
          </p>

          {/* Test Sandbox Instant Verification Helper */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            marginBottom: '24px',
            textAlign: 'left',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Test Sandbox Verification Helper
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Verification token: <code style={{ color: '#f43f5e' }}>{registrationData.verificationToken}</code>
            </div>
            <button
              onClick={() => onNavigateToVerify(registrationData.verificationToken, registrationData.email)}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              <span>Verify Account Now</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <button
            onClick={onNavigateToLogin}
            style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '14px' }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

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
            <UserPlus size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Join SliceCraft to craft artisan pizzas and track kitchen dispatches.
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
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
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '8px' }}
          >
            <span>{loading ? 'Creating Account...' : 'Register & Send Verification Link'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            onClick={onNavigateToLogin}
            style={{ background: 'transparent', color: 'var(--accent-primary)', fontWeight: '600' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
