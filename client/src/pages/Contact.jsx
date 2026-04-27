import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PHONE_1, PHONE_2, WHATSAPP_NUMBER } from '../utils/constants.js';

const T = {
  teal: '#1D9E75', tealDark: '#0F6E56', tealLight: '#E8F8F1',
  wa: '#25D366',
  gray50: '#F9F9F8', gray100: '#F2F1EF', gray200: '#E5E3DE',
  gray400: '#A8A59D', gray500: '#87847C', gray600: '#6B6862',
  gray700: '#4A4845', gray800: '#2E2D2A', gray900: '#1A1917', white: '#FFFFFF',
  font: `'DM Sans', system-ui, sans-serif`,
  fontDisplay: `'Fraunces', Georgia, serif`,
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  .contact-page * { box-sizing: border-box; }
  .contact-grid {
    display: grid; gap: 20px;
    grid-template-columns: 1fr;
  }
  @media (min-width: 768px) {
    .contact-grid { grid-template-columns: 1fr 1fr; }
  }

  .contact-card {
    display: flex; align-items: center; gap: 14px;
    padding: 18px 20px;
    background: ${T.white};
    border: 1.5px solid ${T.gray200};
    border-radius: 16px;
    text-decoration: none;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .contact-card:hover {
    border-color: ${T.teal};
    background: ${T.tealLight};
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(29,158,117,0.15);
  }

  .wa-card {
    display: flex; align-items: center; gap: 14px;
    padding: 18px 20px;
    background: linear-gradient(135deg, #d1fae5 0%, #bbf7d0 100%);
    border: 1.5px solid #86efac;
    border-radius: 16px; text-decoration: none;
    transition: all 0.2s;
  }
  .wa-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(37,211,102,0.25);
  }

  .field-label {
    display: block; font-size: 11px; font-weight: 700;
    letter-spacing: .07em; text-transform: uppercase;
    color: ${T.gray500}; margin-bottom: 6px;
  }
  .field-input {
    width: 100%; padding: 13px 16px;
    border: 1.5px solid ${T.gray200}; border-radius: 12px;
    font-size: 14px; font-family: ${T.font}; color: ${T.gray800};
    background: ${T.white}; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .field-input:focus {
    border-color: ${T.teal};
    box-shadow: 0 0 0 3px rgba(29,158,117,0.12);
  }

  .submit-btn {
    width: 100%; padding: 14px; background: ${T.teal}; color: #fff;
    border: none; border-radius: 12px; font-weight: 800; font-size: 15px;
    cursor: pointer; font-family: ${T.font};
    box-shadow: 0 4px 16px rgba(29,158,117,0.35);
    transition: all 0.2s;
  }
  .submit-btn:hover { background: ${T.tealDark}; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(29,158,117,0.4); }

  .faq-item {
    border-bottom: 1px solid ${T.gray100};
    padding: 14px 0;
    cursor: pointer;
  }
  .faq-item:last-child { border-bottom: none; }
  .faq-q {
    font-weight: 700; font-size: 14px; color: ${T.gray800};
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .faq-a {
    font-size: 13px; color: ${T.gray500}; line-height: 1.6;
    margin-top: 8px;
  }

  .stat-pill {
    background: ${T.white}; border: 1.5px solid ${T.gray200}; border-radius: 14px;
    padding: 14px; text-align: center; flex: 1; min-width: 100px;
  }
`;

const FAQS = [
  { q: 'Which areas do you deliver to?', a: 'We deliver to Dharmapuri and all nearby areas with pincodes starting with 636.' },
  { q: 'How long does delivery take?', a: 'Local deliveries are fulfilled within 6 hours of order confirmation.' },
  { q: 'Do you offer Cash on Delivery?', a: 'Yes! We offer both UPI payment and Cash on Delivery for your convenience.' },
  { q: 'Can I return or exchange products?', a: 'If you receive a damaged or wrong product, WhatsApp us within 24 hours and we will resolve it promptly.' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [focus, setFocus] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const update = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const submit = e => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error('Please fill all fields.');
      return;
    }
    toast.success('✓ Message sent! We\'ll reply on WhatsApp soon.');
    setForm({ name: '', phone: '', message: '' });
  };

  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent('Hello NIRAA 🌿, I have a question about your cleaning products. Please help me.')}`;

  return (
    <main className="contact-page" style={{ background: T.gray50, minHeight: '100vh', fontFamily: T.font }}>
      <style>{css}</style>
      <div className="container" style={{ padding: '32px 16px 80px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ─── Page Header ─── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.teal }}>Support</span>
          </div>
          <h1 style={{ margin: '0 0 8px', fontFamily: T.fontDisplay, fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 900, color: T.gray900, letterSpacing: '-.03em' }}>
            We're here<br />to help. 👋
          </h1>
          <p style={{ margin: '0 0 24px', color: T.gray400, fontSize: 15, maxWidth: 440, lineHeight: 1.6 }}>
            WhatsApp-first support for Dharmapuri & nearby areas. We typically reply within 30 minutes.
          </p>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {[['⚡', '< 30 min', 'Avg. Reply Time'], ['🌿', '500+', 'Happy Customers'], ['📦', '6 hrs', 'Delivery Time']].map(([icon, val, label]) => (
              <div key={label} className="stat-pill">
                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontWeight: 900, fontSize: 16, color: T.tealDark }}>{val}</div>
                <div style={{ fontSize: 11, color: T.gray400, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={waLink} target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: T.wa, color: '#fff', borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              Chat on WhatsApp
            </a>
            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: T.white, color: T.gray700, border: `1.5px solid ${T.gray200}`, borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Browse Products
            </Link>
          </div>
        </div>

        <div className="contact-grid">

          {/* ─── Left: Contact Info ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: T.white, border: `1.5px solid ${T.gray200}`, borderRadius: 20, padding: 24, boxShadow: T.shadow }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: T.gray900, marginBottom: 16 }}>Get in Touch</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href={`tel:${PHONE_1}`} className="contact-card">
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: T.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📞</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: T.gray400, marginBottom: 2 }}>Call Us</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.tealDark }}>{PHONE_1}</div>
                  </div>
                </a>
                <a href={`tel:${PHONE_2}`} className="contact-card">
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: T.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📱</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: T.gray400, marginBottom: 2 }}>Alternate</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.tealDark }}>{PHONE_2}</div>
                  </div>
                </a>
                <a href={waLink} target="_blank" rel="noreferrer" className="wa-card">
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#16a34a"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: '#166534', marginBottom: 2 }}>WhatsApp</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#15803d' }}>Chat instantly →</div>
                  </div>
                </a>
              </div>

              {/* Location */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.gray100}` }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: T.gray900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📍</span> Our Location
                </div>
                <div style={{ fontSize: 13, color: T.gray500, marginBottom: 12, fontWeight: 600 }}>
                  Dharmapuri, Tamil Nadu — Local delivery & support
                </div>
                <div style={{ borderRadius: 14, overflow: 'hidden', border: `1.5px solid ${T.gray200}` }}>
                  <iframe
                    title="NIRAA location map"
                    src="https://www.google.com/maps?q=Dharmapuri%2C%20Tamil%20Nadu&output=embed"
                    width="100%" height="200" style={{ border: 0, display: 'block' }}
                    loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div style={{ background: T.white, border: `1.5px solid ${T.gray200}`, borderRadius: 20, padding: 24, boxShadow: T.shadow }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: T.gray900, marginBottom: 4 }}>Frequently Asked</div>
              <div style={{ fontSize: 13, color: T.gray400, marginBottom: 16 }}>Quick answers to common questions</div>
              {FAQS.map((faq, i) => (
                <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="faq-q">
                    <span>{faq.q}</span>
                    <span style={{ color: T.teal, fontSize: 18, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  {openFaq === i && <div className="faq-a">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right: Message Form ─── */}
          <div style={{ background: T.white, border: `1.5px solid ${T.gray200}`, borderRadius: 20, padding: 28, boxShadow: T.shadow }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: T.gray900, marginBottom: 4, fontFamily: T.fontDisplay }}>Send a Message</div>
            <div style={{ fontSize: 13, color: T.gray400, marginBottom: 24, lineHeight: 1.6 }}>
              Fill in the form and we'll get back to you on WhatsApp within a few hours.
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="field-label">Your Name</label>
                <input type="text" name="name" value={form.name} onChange={update}
                  onFocus={() => setFocus('name')} onBlur={() => setFocus(null)}
                  placeholder="e.g. Rajesh Kumar" className="field-input" />
              </div>
              <div>
                <label className="field-label">Phone Number</label>
                <input type="tel" name="phone" value={form.phone} onChange={update}
                  onFocus={() => setFocus('phone')} onBlur={() => setFocus(null)}
                  placeholder="10-digit mobile number" className="field-input" />
              </div>
              <div>
                <label className="field-label">Your Message</label>
                <textarea name="message" value={form.message} onChange={update}
                  onFocus={() => setFocus('message')} onBlur={() => setFocus(null)}
                  placeholder="How can we help you today?" rows={5}
                  className="field-input" style={{ resize: 'vertical', lineHeight: 1.6 }} />
              </div>
              <button type="submit" className="submit-btn">Send Message →</button>
            </form>

            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: T.tealLight, borderRadius: 12, fontSize: 13, color: T.tealDark, fontWeight: 600 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <span>For the fastest response, WhatsApp us directly. We reply within 30 minutes!</span>
            </div>

            {/* Office hours */}
            <div style={{ marginTop: 16, padding: '14px 16px', background: T.gray50, borderRadius: 12, fontSize: 12 }}>
              <div style={{ fontWeight: 800, color: T.gray700, marginBottom: 8 }}>🕐 Support Hours</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[['Mon – Sat', '9:00 AM – 8:00 PM'], ['Sunday', '10:00 AM – 6:00 PM']].map(([day, time]) => (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.gray500, fontWeight: 600 }}>
                    <span>{day}</span><span style={{ color: T.tealDark }}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}