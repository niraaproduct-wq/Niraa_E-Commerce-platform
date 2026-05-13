import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const MenuItem = ({ onClick, emoji, children, danger }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', textAlign: 'left', padding: '10px 16px',
      background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer',
      fontSize: '0.9rem', fontWeight: 500,
      color: danger ? '#dc2626' : 'var(--gray-700)',
      display: 'flex', alignItems: 'center', gap: 12,
      transition: 'background 0.15s ease, transform 0.15s ease, padding-left 0.15s ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = danger ? '#fef2f2' : 'var(--gray-50)';
      e.currentTarget.style.paddingLeft = '20px';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.paddingLeft = '16px';
    }}
    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
  >
    <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
    {children}
  </button>
);

const UserDropdown = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) setTimeout(() => setVisible(true), 10);
    else setVisible(false);
  }, [isOpen]);

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const go = (path) => { setIsOpen(false); navigate(path); };
  const handleLogout = () => { setIsOpen(false); logout(); navigate('/'); };

  return (
    <>
      <style>{`
        @keyframes udIn  { from { opacity:0; transform:translateY(-8px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes udOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(-8px) scale(0.96); } }
        .ud-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--teal); display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.9rem;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
          flex-shrink: 0;
        }
        .ud-trigger { cursor: pointer; }
        .ud-trigger:hover .ud-avatar {
          transform: scale(1.12);
          box-shadow: 0 4px 12px rgba(42,125,114,0.35);
        }
      `}</style>

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <div
          className="ud-trigger"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: 8,
            borderRadius: 8,
            transition: 'background 0.15s ease',
            background: isOpen ? 'var(--gray-100)' : 'transparent',
          }}
        >
          <div className="ud-avatar">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span
            className="hide-mobile"
            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--teal-dark)', transition: 'color 0.2s ease' }}
          >
            {user.name?.split(' ')[0]}
          </span>
          <span style={{
            fontSize: '0.6rem', color: 'var(--gray-400)',
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'block',
          }}>▼</span>
        </div>

        {isOpen && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 8,
            minWidth: 210, background: '#fff', borderRadius: 14,
            boxShadow: '0 12px 40px rgba(0,0,0,0.13)',
            border: '1px solid var(--gray-200)',
            zIndex: 1000, overflow: 'hidden',
            animation: `${visible ? 'udIn' : 'udOut'} 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards`,
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--gray-100)',
              background: 'linear-gradient(135deg, rgba(42,125,114,0.06), rgba(42,125,114,0.02))',
            }}>
              <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{user.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: 2 }}>{user.phone}</div>
            </div>

            {/* Items */}
            <div style={{ padding: 8 }}>
              <MenuItem onClick={() => go('/profile')} emoji="👤">My Profile</MenuItem>
              <MenuItem onClick={() => go('/profile/orders')} emoji="📦">My Orders</MenuItem>
            </div>

            <div style={{ padding: 8, borderTop: '1px solid var(--gray-100)' }}>
              <MenuItem onClick={handleLogout} emoji="🚪" danger>Sign Out</MenuItem>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserDropdown;