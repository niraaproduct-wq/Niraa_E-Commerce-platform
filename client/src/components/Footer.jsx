import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { PHONE_1, WHATSAPP_NUMBER } from '../utils/constants.js';
import logoImage from '../assets/images/logo.jpeg';

const FooterLink = ({ to, children }) => (
  <Link
    to={to}
    style={{ display: 'block', color: '#c5e8e5', fontSize: '0.9rem', marginBottom: 10, textDecoration: 'none', transition: 'color 0.2s ease, padding-left 0.2s ease' }}
    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.paddingLeft = '6px'; }}
    onMouseLeave={e => { e.currentTarget.style.color = '#c5e8e5'; e.currentTarget.style.paddingLeft = '0'; }}
  >
    {children}
  </Link>
);

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          footer.style.opacity = '1';
          footer.style.transform = 'translateY(0)';
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes footerIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .footer-wa-btn {
          display: inline-flex; align-items: center; gap: 8px;
          margin-top: 20px; background: #25D366; color: #fff;
          padding: 10px 20px; border-radius: var(--radius-full);
          font-size: 0.85rem; font-weight: 600; text-decoration: none;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.25s ease, filter 0.2s ease;
          box-shadow: 0 6px 18px rgba(37,211,102,0.3);
        }
        .footer-wa-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 28px rgba(37,211,102,0.45);
          filter: brightness(1.06);
        }
        .footer-contact-link {
          display: flex; align-items: flex-start; gap: 10;
          margin-bottom: 14px; color: #c5e8e5; font-size: 0.88rem;
          text-decoration: none;
          transition: color 0.2s ease, gap 0.2s ease;
        }
        .footer-contact-link:hover { color: #fff; gap: 14px; }
        .footer-logo-wrap {
          width: 44px; height: 44px; border-radius: 14px; overflow: hidden;
          background: #fff; border: 1px solid rgba(255,255,255,0.18);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.3s ease;
        }
        .footer-logo-wrap:hover {
          transform: rotate(-6deg) scale(1.1);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        .footer-heading {
          font-weight: 600; font-size: 0.9rem;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 18px; color: var(--gold-light);
          position: relative; display: inline-block;
        }
        .footer-heading::after {
          content: ''; position: absolute; bottom: -6px; left: 0;
          width: 24px; height: 2px; background: var(--gold-light);
          border-radius: 2px; transition: width 0.3s ease;
        }
        .footer-col:hover .footer-heading::after { width: 100%; }
      `}</style>

      <footer
        ref={footerRef}
        style={{
          background: 'var(--teal-dark)', color: '#fff', paddingTop: 56,
          opacity: 0, transform: 'translateY(24px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40, paddingBottom: 48,
        }}>

          {/* Brand */}
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="footer-logo-wrap">
                <img src={logoImage} alt="NIRAA logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.06em', color: '#fff' }}>NIRAA</div>
                <div style={{ fontSize: '0.75rem', color: '#a8d5d0', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: -2 }}>Wellness & essentials</div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }} />
            <p style={{ fontSize: '0.88rem', color: '#c5e8e5', lineHeight: 1.7 }}>
              Making homes cleaner, safer, and healthier with eco-friendly cleaning products.
            </p>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="footer-wa-btn">
              <FaWhatsapp size={18} /> WhatsApp Us
            </a>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            {[['/', 'Home'], ['/products', 'Products'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([to, label]) => (
              <FooterLink key={to} to={to}>{label}</FooterLink>
            ))}
          </div>

          {/* Products */}
          <div className="footer-col">
            <h4 className="footer-heading">Products</h4>
            {['Floor Cleaner', 'Toilet Cleaner', 'Dish Wash', 'Detergent', 'Tiles Cleaner', 'Combo Pack'].map(p => (
              <FooterLink key={p} to="/products">{p}</FooterLink>
            ))}
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact</h4>
            <a
              href="https://maps.app.goo.gl/xRtJMzmbtsAPsztr5"
              target="_blank" rel="noreferrer"
              className="footer-contact-link"
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, color: '#c5e8e5', fontSize: '0.88rem', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#c5e8e5'}
            >
              <FiMapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>Near Old Bus Stand, Dharmapuri, TN</span>
            </a>
            <a
              href={`tel:${PHONE_1}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: '#c5e8e5', fontSize: '0.88rem', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#c5e8e5'}
            >
              <FiPhone size={16} /> {PHONE_1}
            </a>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.12)',
          padding: '18px 20px', textAlign: 'center',
          fontSize: '0.8rem', color: '#a8d5d0',
        }}>
          © {new Date().getFullYear()} NIRAA Wellness & Lifestyle. All rights reserved. | Made with 💚 in Dharmapuri
        </div>
      </footer>
    </>
  );
}