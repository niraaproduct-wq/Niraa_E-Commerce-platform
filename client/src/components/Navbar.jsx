import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FiShoppingCart, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { AiOutlineWhatsApp } from 'react-icons/ai';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import logoImage from '../assets/images/logo.jpeg';
import LoginModal from './LoginModal.jsx';

const NAV_LINKS = [
  { to: '/',          label: 'Home'     },
  { to: '/products',  label: 'Products' },
  { to: '/about',     label: 'About'    },
  { to: '/contact',   label: 'Contact'  },
];

export default function Navbar() {
  const { totalItems }      = useCart();
  const { user, logout }    = useAuth();
  const { pathname }        = useLocation();
  const [open, setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : '0 1px 0 #e5e7eb',
      transition: 'all 0.3s ease',
    }}>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid rgba(42, 125, 114, 0.18)',
            boxShadow: '0 10px 24px rgba(42,125,114,0.12)',
            background: '#fff',
            flexShrink: 0,
          }}>
            <img
              src={logoImage}
              alt="NIRAA logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--teal-dark)', letterSpacing: '0.06em' }}>NIRAA</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: -2 }}>Fresh home care essentials</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hide-mobile" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              fontSize: '0.9rem', fontWeight: 500,
              color: pathname === to ? 'var(--teal)' : 'var(--gray-600)',
              borderBottom: pathname === to ? '2px solid var(--teal)' : '2px solid transparent',
              paddingBottom: 2, transition: 'var(--transition)',
            }}>{label}</Link>
          ))}
        </div>

        {/* Right: Cart + Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--teal-dark)', textDecoration: 'none' }}>
            <AiOutlineWhatsApp size={20} />
            <span className="hide-mobile" style={{ fontWeight: 700 }}>WhatsApp</span>
          </a>

          {/* User Auth */}
          {user ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 8 }} onClick={logout}>
               <FiUser size={20} color="var(--teal-dark)" />
               <span className="hide-mobile" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--teal-dark)' }}>{user.name?.split(' ')[0]} (Out)</span>
            </div>
          ) : (
             <button onClick={() => setIsLoginOpen(true)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--teal-dark)', padding: 8 }}>
                 <FiUser size={20} />
                 <span className="hide-mobile" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Login</span>
             </button>
          )}

          <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: 8 }}>
            <FiShoppingCart size={22} color="var(--teal-dark)" />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                background: 'var(--gold)', color: '#fff',
                borderRadius: '50%', width: 18, height: 18,
                fontSize: '0.65rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{totalItems}</span>
            )}
          </Link>
          <button
            className="hide-desktop"
            onClick={() => setOpen(!open)}
            style={{ background: 'none', padding: 6, color: 'var(--teal-dark)' }}
          >
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={{
          background: '#fff', borderTop: '1px solid var(--gray-200)',
          padding: '12px 20px 20px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              display: 'block', padding: '12px 0',
              fontWeight: 500, fontSize: '1rem',
              color: pathname === to ? 'var(--teal)' : 'var(--gray-800)',
              borderBottom: '1px solid var(--gray-100)',
            }}>{label}</Link>
          ))}
        </div>
      )}
    </nav>
  );
}