import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const UserDropdown = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleOrders = () => {
    setIsOpen(false);
    navigate('/profile/orders');
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          cursor: 'pointer', 
          padding: 8,
          borderRadius: 8,
          transition: 'background 0.15s ease',
          background: isOpen ? 'var(--gray-100)' : 'transparent'
        }}
      >
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--teal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="hide-mobile" style={{ 
          fontSize: '0.85rem', 
          fontWeight: 600, 
          color: 'var(--teal-dark)' 
        }}>
          {user.name?.split(' ')[0]}
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 8,
          minWidth: 200,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid var(--gray-200)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'slideDown 0.15s ease'
        }}>
          {/* User Info Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--gray-100)',
            background: 'var(--gray-50)'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{user.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 2 }}>{user.phone}</div>
          </div>

          {/* Menu Items */}
          <div style={{ padding: 8 }}>
            <button
              onClick={handleProfile}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--gray-700)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'background 0.1s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--gray-50)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1.1rem' }}>👤</span>
              My Profile
            </button>

            <button
              onClick={handleOrders}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--gray-700)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'background 0.1s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--gray-50)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1.1rem' }}>📦</span>
              My Orders
            </button>
          </div>

          {/* Logout Button */}
          <div style={{ padding: 8, borderTop: '1px solid var(--gray-100)' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'background 0.1s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1.1rem' }}>🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;