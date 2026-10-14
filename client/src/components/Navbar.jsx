import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import { 
  Flame, 
  Pizza, 
  ShoppingCart, 
  User, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Sparkles, 
  Clock,
  Radio
} from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemCount } = useCart();
  const { isConnected } = useSocket();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentView('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--grad-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
          }}>
            <Flame size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              fontFamily: 'var(--font-heading)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>Slice<span style={{ color: 'var(--accent-primary)' }}>Craft</span></span>
              <span className="badge badge-warning" style={{ fontSize: '9px', padding: '2px 6px' }}>Artisan</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '-2px' }}>
              Wood-Fired Pizza Kitchen
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{
              background: currentView === 'home' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: currentView === 'home' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Pizza size={16} />
            <span>Menu Varieties</span>
          </button>

          <button
            onClick={() => setCurrentView('builder')}
            style={{
              background: currentView === 'builder' ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
              color: currentView === 'builder' ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: currentView === 'builder' ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={16} color="var(--accent-primary)" />
            <span>Custom Pizza Builder</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setCurrentView('orders')}
              style={{
                background: currentView === 'orders' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: currentView === 'orders' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={16} />
              <span>Track Orders</span>
            </button>
          )}

          {/* Admin portal shortcut */}
          <button
            onClick={() => setCurrentView(isAdmin ? 'admin-inventory' : 'admin-login')}
            style={{
              background: currentView.startsWith('admin') ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
              color: currentView.startsWith('admin') ? '#f43f5e' : 'var(--text-muted)',
              border: currentView.startsWith('admin') ? '1px solid rgba(225, 29, 72, 0.3)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={16} />
            <span>Admin Portal</span>
          </button>
        </nav>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Real-time indicator */}
          <div
            title={isConnected ? 'Real-time WebSocket connected' : 'Connecting to real-time engine...'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? '#10b981' : '#f59e0b',
                boxShadow: isConnected ? '0 0 8px #10b981' : 'none',
              }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              {isConnected ? 'Live Socket' : 'Syncing'}
            </span>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setCurrentView('checkout')}
            style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              padding: '9px 14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
            }}
          >
            <ShoppingCart size={18} />
            {totalItemCount > 0 && (
              <span
                style={{
                  background: 'var(--accent-secondary)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 7px',
                  borderRadius: '10px',
                }}
              >
                {totalItemCount}
              </span>
            )}
          </button>

          {/* User Auth Menu */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isAdmin ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '12px',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>
                  {user.name.split(' ')[0]}
                  {isAdmin && (
                    <span style={{ fontSize: '10px', color: '#f43f5e', marginLeft: '4px' }}>
                      (Admin)
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentView('login')}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
