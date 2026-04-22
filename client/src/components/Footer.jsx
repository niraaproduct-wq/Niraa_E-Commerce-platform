import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { PHONE_1, PHONE_2, WHATSAPP_NUMBER } from '../utils/constants.js';
import logoImage from '../assets/images/logo.jpeg';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--teal-dark)', color: '#fff', paddingTop: 56 }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 40,
        paddingBottom: 48,
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, overflow: 'hidden', background: '#fff', border: '1px solid rgba(255,255,255,0.18)' }}>
              <img src={logoImage} alt="NIRAA logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.06em', color: '#fff' }}>NIRAA</div>
              <div style={{ fontSize: '0.75rem', color: '#a8d5d0', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: -2 }}>Wellness & essentials</div>
            </div>
          </div>
          <div style={{ marginBottom: 14 }} />
          <p style={{ fontSize: '0.88rem', color: '#c5e8e5', lineHeight: 1.7 }}>
            Making homes cleaner, safer, and healthier with our eco-friendly cleaning products.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank" rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 20, background: '#25D366', color: '#fff',
              padding: '10px 20px', borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem', fontWeight: 600,
              transition: 'var(--transition)',
            }}
          >
            <FaWhatsapp size={18} /> WhatsApp Us
          </a>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18, color: 'var(--gold-light)' }}>Quick Links</h4>
          {[
            ['/', 'Home'], ['/products', 'Products'], ['/about', 'About Us'], ['/contact', 'Contact'],
          ].map(([to, label]) => (
            <Link key={to} to={to} style={{ display: 'block', color: '#c5e8e5', fontSize: '0.9rem', marginBottom: 10, transition: 'var(--transition)' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#c5e8e5'}
            >{label}</Link>
          ))}
        </div>

        {/* Products */}
        <div>
          <h4 style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18, color: 'var(--gold-light)' }}>Products</h4>
          {['Floor Cleaner', 'Toilet Cleaner', 'Dish Wash', 'Detergent', 'Tiles Cleaner', 'Combo Pack'].map(p => (
            <Link key={p} to="/products" style={{ display: 'block', color: '#c5e8e5', fontSize: '0.9rem', marginBottom: 10 }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#c5e8e5'}
            >{p}</Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18, color: 'var(--gold-light)' }}>Contact</h4>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, color: '#c5e8e5', fontSize: '0.88rem' }}>
            <FiMapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>Dharmapuri, Tamil Nadu</span>
          </div>
          <a href={`tel:${PHONE_1}`} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: '#c5e8e5', fontSize: '0.88rem' }}>
            <FiPhone size={16} /> {PHONE_1}
          </a>
          <a href={`tel:${PHONE_2}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#c5e8e5', fontSize: '0.88rem' }}>
            <FiPhone size={16} /> {PHONE_2}
          </a>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', padding: '18px 20px', textAlign: 'center', fontSize: '0.8rem', color: '#a8d5d0' }}>
        © {new Date().getFullYear()} NIRAA Wellness & Lifestyle. All rights reserved. | Made with 💚 in Dharmapuri
      </div>
    </footer>
  );
}