import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FiShoppingCart, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { AiOutlineWhatsApp } from 'react-icons/ai';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import logoImage from '../assets/images/logo.jpeg';
import LoginModal from './LoginModal.jsx';
import UserDropdown from './UserDropdown.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  // Bump cart icon on item add
  useEffect(() => {
    if (!totalItems) return;
    setCartBump(true);
    const t = setTimeout(() => setCartBump(false), 400);
    return () => clearTimeout(t);
  }, [totalItems]);

  return (
    <>
      <style>{`
        @keyframes navCartBump {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.35) rotate(-8deg); }
          70%  { transform: scale(0.95) rotate(4deg); }
          100% { transform: scale(1); }
        }
        @keyframes navBadgePop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.25); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes mobileMenuIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-link-item {
          position: relative;
          font-size: 0.9rem;
          font-weight: 500;
          padding-bottom: 2px;
          transition: color 0.2s ease;
          text-decoration: none;
        }
        .nav-link-item::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 50%; right: 50%;
          height: 2px;
          background: var(--teal);
          border-radius: 2px;
          transition: left 0.25s cubic-bezier(0.34,1.56,0.64,1),
                      right 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .nav-link-item.active::after,
        .nav-link-item:hover::after {
          left: 0; right: 0;
        }
        .nav-link-item.active { color: var(--teal) !important; }
        .nav-link-item:hover  { color: var(--teal) !important; }
        .nav-wa-btn {
          display: flex; align-items: center; gap: 8px;
          color: var(--teal-dark); text-decoration: none;
          padding: 6px 10px; border-radius: 8px;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .nav-wa-btn:hover { background: rgba(42,125,114,0.08); transform: translateY(-1px); }
        .nav-login-btn {
          background: var(--teal-light); border: none;
          display: flex; align-items: center; gap: 6px;
          cursor: pointer; color: var(--teal-dark);
          padding: 8px 16px; border-radius: 8px; font-weight: 600;
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .nav-login-btn:hover {
          background: rgba(42,125,114,0.18);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(42,125,114,0.15);
        }
        .nav-cart-link {
          position: relative; display: flex; align-items: center; padding: 8px;
          border-radius: 8px; transition: background 0.2s ease;
        }
        .nav-cart-link:hover { background: rgba(42,125,114,0.08); }
        .mobile-nav-link {
          display: block; padding: 14px 0;
          font-weight: 500; font-size: 1rem;
          border-bottom: 1px solid var(--gray-100);
          text-decoration: none;
          transition: color 0.2s ease, padding-left 0.2s ease;
        }
        .mobile-nav-link:hover { padding-left: 8px; color: var(--teal) !important; }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.09)' : '0 1px 0 #e5e7eb',
        transition: 'background 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease',
      }}>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14, overflow: 'hidden',
              border: '1px solid rgba(42,125,114,0.18)',
              boxShadow: '0 4px 16px rgba(42,125,114,0.12)',
              background: '#fff', flexShrink: 0,
              transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'rotate(-4deg) scale(1.08)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(42,125,114,0.22)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(42,125,114,0.12)';
              }}
            >
              <img src={logoImage} alt="NIRAA logo" width={46} height={46} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--teal-dark)', letterSpacing: '0.06em' }}>NIRAA</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--gray-600)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: -2 }}>Wellness & Home Essentials</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hide-mobile" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link-item${pathname === to ? ' active' : ''}`}
                style={{ color: pathname === to ? 'var(--teal)' : 'var(--gray-600)' }}
              >{label}</Link>
            ))}
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}`}
              target="_blank" rel="noreferrer"
              className="nav-wa-btn"
              aria-label="WhatsApp"
            >
              <AiOutlineWhatsApp size={20} />
              <span className="hide-mobile" style={{ fontWeight: 700 }}>WhatsApp</span>
            </a>

            {user ? (
              <UserDropdown user={user} />
            ) : (
              <button onClick={() => navigate('/login')} className="nav-login-btn" aria-label="Login">
                <FiUser size={18} />
                <span className="hide-mobile">Login</span>
              </button>
            )}

            <Link to="/cart" className="nav-cart-link" aria-label="Shopping Cart">
              <FiShoppingCart
                size={22}
                color="var(--teal-dark)"
                style={{
                  animation: cartBump ? 'navCartBump 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
                  display: 'block',
                }}
              />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'var(--gold)', color: '#fff',
                  borderRadius: '50%', width: 18, height: 18,
                  fontSize: '0.65rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'navBadgePop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                }}>{totalItems}</span>
              )}
            </Link>

            <button
              className="hide-desktop"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              style={{
                background: 'none', padding: 6, color: 'var(--teal-dark)',
                border: 'none', cursor: 'pointer',
                transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              {open ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div style={{
            background: '#fff', borderTop: '1px solid var(--gray-200)',
            padding: '8px 20px 20px',
            animation: 'mobileMenuIn 0.22s ease',
          }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="mobile-nav-link"
                style={{ color: pathname === to ? 'var(--teal)' : 'var(--gray-800)' }}
              >{label}</Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}