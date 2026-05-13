import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { WHATSAPP_NUMBER } from '../utils/constants.js';

export default function FloatingWhatsApp() {
  const { pathname } = useLocation();
  const [hovered, setHovered] = useState(false);

  const waText = useMemo(() => {
    const base = `Hello NIRAA, I'd like to order.`;
    if (pathname.startsWith('/products/')) return `${base} Product page: ${decodeURIComponent(pathname).slice(1)}.`;
    if (pathname === '/cart') return `${base} I have items in my cart. Please help me with the order.`;
    if (pathname === '/checkout') return `${base} I'm ordering from checkout. Please confirm.`;
    if (pathname === '/contact') return `${base} I want to ask a question. Please help me.`;
    return base;
  }, [pathname]);

  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  return (
    <>
      <style>{`
        @keyframes waPulse {
          0%, 100% { box-shadow: 0 10px 26px rgba(37,211,102,0.4), 0 0 0 0 rgba(37,211,102,0.4); }
          50%       { box-shadow: 0 10px 26px rgba(37,211,102,0.4), 0 0 0 10px rgba(37,211,102,0); }
        }
        @keyframes waIn {
          from { transform: scale(0) rotate(-180deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);    opacity: 1; }
        }
        .wa-float {
          position: fixed; right: 16px; bottom: 18px; z-index: 999;
          background: #25D366; color: #fff;
          width: 54px; height: 54px; border-radius: 9999px;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; font-weight: 900;
          animation: waIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.8s both,
                     waPulse 2.5s ease 2s infinite;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                      width 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      border-radius 0.3s ease,
                      box-shadow 0.3s ease;
          overflow: hidden; white-space: nowrap;
        }
        .wa-float:hover {
          transform: scale(1.1);
          animation: none;
          box-shadow: 0 16px 36px rgba(37,211,102,0.5);
        }
        .wa-label {
          max-width: 0; overflow: hidden; opacity: 0;
          transition: max-width 0.3s ease, opacity 0.25s ease, margin 0.3s ease;
          font-size: 0.85rem; font-weight: 700;
        }
        .wa-float:hover .wa-label {
          max-width: 120px; opacity: 1; margin-left: 6px;
        }
        .wa-float:hover {
          width: auto; padding: 0 18px; border-radius: 27px;
        }
        .wa-icon { font-size: 1.1rem; flex-shrink: 0; }
      `}</style>

      <a
        className="wa-float"
        href={waLink}
        target="_blank"
        rel="noreferrer"
        aria-label="Order via WhatsApp"
        title="Order via WhatsApp"
      >
        <span className="wa-icon">💬</span>
        <span className="wa-label">WhatsApp</span>
      </a>
    </>
  );
}