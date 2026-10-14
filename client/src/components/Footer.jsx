import React from 'react';
import { Flame, ShieldCheck, Heart } from 'lucide-react';

export const Footer = ({ onNavigateToAdmin, onNavigateToMenu, onNavigateToBuilder }) => {
  return (
    <footer style={{
      background: 'rgba(9, 13, 22, 0.95)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px 20px 32px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          marginBottom: '36px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--grad-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Flame size={18} color="#fff" />
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>
                Slice<span style={{ color: 'var(--accent-primary)' }}>Craft</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', maxWidth: '300px' }}>
              Handcrafted wood-fired pizzas, live custom builder, real-time kitchen tracking, and automated stock notification engine.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              Navigation
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
              <span onClick={onNavigateToMenu} style={{ cursor: 'pointer' }}>Artisan Pizza Varieties</span>
              <span onClick={onNavigateToBuilder} style={{ cursor: 'pointer' }}>Custom Pizza Studio</span>
              <span onClick={onNavigateToAdmin} style={{ cursor: 'pointer', color: '#f43f5e' }}>Admin Control Center</span>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              Full-Stack Architecture
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Razorpay', 'Socket.io', 'node-cron', 'Nodemailer'].map((tech) => (
                <span key={tech} className="badge badge-info" style={{ fontSize: '10px' }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--text-dim)',
        }}>
          <div>© {new Date().getFullYear()} SliceCraft Gourmet Pizza Systems. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Production-grade Pizza Ordering & Automated Inventory Management Platform
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
