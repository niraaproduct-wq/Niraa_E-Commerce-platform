import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { WHATSAPP_NUMBER } from '../utils/constants.js';

export default function FloatingWhatsApp() {
  const { pathname } = useLocation();

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
    <a
      className="whatsapp-float"
      href={waLink}
      target="_blank"
      rel="noreferrer"
      aria-label="Order via WhatsApp"
      title="Order via WhatsApp"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 18,
        zIndex: 999,
        background: '#25D366',
        color: '#fff',
        width: 54,
        height: 54,
        borderRadius: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 26px rgba(0,0,0,0.18)',
        textDecoration: 'none',
        fontWeight: 900,
      }}
    >
      WA
    </a>
  );
}

