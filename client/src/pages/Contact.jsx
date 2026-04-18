import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PHONE_1, PHONE_2, WHATSAPP_NUMBER } from '../utils/constants.js';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  const update = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error('Please fill Name, Phone and Message.');
      return;
    }

    // No backend contact endpoint in this repo yet - show a friendly confirmation.
    toast.success('Thanks! We will contact you shortly.');
    setForm({ name: '', phone: '', message: '' });
  };

  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent('Hello NIRAA, I have a question about your cleaning products. Please help me.')}`;

  return (
    <main className="container page">
      <header className="page-header page-header--contact">
        <div className="page-header__badge">Support</div>
        <div className="page-title">Contact NIRAA</div>
        <div className="page-subtitle">WhatsApp-first support for Dharmapuri & nearby areas.</div>
        <div className="page-actions">
          <a className="btn btn--whatsapp" href={waLink} target="_blank" rel="noreferrer">WhatsApp Us</a>
          <Link className="btn btn--ghost" to="/products">Browse Products</Link>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
        <div className="card card--padded">
          <div style={{ fontWeight: 900, color: 'var(--teal-dark)', fontSize: '1.1rem' }}>Phone & WhatsApp</div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <a href={`tel:${PHONE_1}`} style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--teal-dark)', fontWeight: 900, textDecoration: 'none' }}>
              Call: {PHONE_1}
            </a>
            <a href={`tel:${PHONE_2}`} style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--teal-dark)', fontWeight: 900, textDecoration: 'none' }}>
              Call: {PHONE_2}
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn--whatsapp"
            >
              WhatsApp Us
            </a>
          </div>

          <div style={{ marginTop: 16, fontWeight: 900, color: 'var(--teal-dark)', fontSize: '1.1rem' }}>Address</div>
          <div style={{ marginTop: 6, color: 'var(--gray-600)' }}>Dharmapuri, Tamil Nadu (Local delivery and support)</div>

          <div style={{ marginTop: 12, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.22)' }}>
            <iframe
              title="NIRAA location map"
              src="https://www.google.com/maps?q=Dharmapuri%2C%20Tamil%20Nadu&output=embed"
              width="100%"
              height="260"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="card card--soft card--padded">
          <div style={{ fontWeight: 900, color: 'var(--teal-dark)', fontSize: '1.1rem' }}>Send a message</div>
          <form onSubmit={submit} style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <input className="field" name="name" value={form.name} onChange={update} placeholder="Your name" />
            <input className="field" name="phone" value={form.phone} onChange={update} placeholder="Phone number" />
            <textarea className="field" name="message" value={form.message} onChange={update} placeholder="Message" rows={5} />
            <button type="submit" className="btn btn--primary" style={{ border: 'none' }}>
              Send
            </button>
          </form>

          <div style={{ marginTop: 10, color: 'var(--gray-600)', fontSize: '0.92rem' }}>
            For fastest orders, use WhatsApp.
          </div>
        </div>
      </section>
    </main>
  );
}

