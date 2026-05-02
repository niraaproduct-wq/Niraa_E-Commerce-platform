import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiDroplet, FiHeart, FiTruck, FiAward, FiStar, FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import bannerImage from '../assets/images/banner.jpeg';
import SectionRenderer from '../components/SectionRenderer';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? (import.meta.env.VITE_API_BASE_URL.endsWith('/api') ? import.meta.env.VITE_API_BASE_URL : `${import.meta.env.VITE_API_BASE_URL}/api`)
  : '/api';

const WHY_CHOOSE = [
  {
    icon: <FiShield size={26} />,
    title: 'Safe for Families',
    desc: 'All NIRAA products are formulated without harsh chemicals. Gentle enough for homes with kids and pets, yet powerful against dirt and germs.',
    color: '#0d7a6a',
    bg: '#f0faf8',
  },
  {
    icon: <FiDroplet size={26} />,
    title: 'Eco-Friendly Formulas',
    desc: 'We use biodegradable ingredients and offer refill packs to reduce plastic waste. Cleaning your home shouldn\'t cost the planet.',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    icon: <FiAward size={26} />,
    title: '99.9% Germ Kill',
    desc: 'Our clinically tested formulas eliminate 99.9% of germs and bacteria, protecting your family from infections and illness.',
    color: '#b27700',
    bg: '#fffbeb',
  },
  {
    icon: <FiTruck size={26} />,
    title: 'Fast Local Delivery',
    desc: 'Serving Dharmapuri and nearby areas with quick delivery. Order via WhatsApp and get your products the same day or next day.',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    icon: <FiHeart size={26} />,
    title: 'Made with Care',
    desc: 'Every product is carefully formulated and quality-tested to ensure it delivers real, visible cleaning results that you can trust.',
    color: '#e11d48',
    bg: '#fff1f2',
  },
  {
    icon: <FiUsers size={26} />,
    title: 'Community Focused',
    desc: 'We\'re a local brand serving local families. Your feedback directly shapes our products and services. We grow together.',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya M.',
    location: 'Dharmapuri',
    rating: 5,
    text: 'The floor cleaner leaves my marble floors so shiny! The lemon fragrance stays for hours. Best local brand I\'ve used.',
    product: 'Floor Cleaner – Lemon Fresh',
    initials: 'PM',
    avatarBg: 'linear-gradient(135deg, #0d7a6a, #1a4f47)',
  },
  {
    name: 'Rajesh K.',
    location: 'Pennagaram',
    rating: 5,
    text: 'Ordered the Complete Home Combo — superb value! All 6 products work great. My wife loves the fabric conditioner especially.',
    product: 'Complete Home Combo',
    initials: 'RK',
    avatarBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  },
  {
    name: 'Meena S.',
    location: 'Dharmapuri',
    rating: 4,
    text: 'The toilet cleaner is really strong but doesn\'t have that harsh chemical smell. My bathroom has never been cleaner. Will order again.',
    product: 'Toilet Cleaner – Power Ultra',
    initials: 'MS',
    avatarBg: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
  },
  {
    name: 'Arjun V.',
    location: 'Harur',
    rating: 5,
    text: 'Delivery was very fast. I ordered via WhatsApp and got my products the same evening. Quality is better than big brands at half the price.',
    product: 'Kitchen Sparkle Duo',
    initials: 'AV',
    avatarBg: 'linear-gradient(135deg, #c8a84b, #d4a843)',
  },
  {
    name: 'Lakshmi R.',
    location: 'Palacode',
    rating: 5,
    text: 'The Eco Green detergent is so gentle on my silk sarees but cleans cotton clothes perfectly. Finally a detergent I can trust for everything!',
    product: 'Detergent Liquid – Eco Green',
    initials: 'LR',
    avatarBg: 'linear-gradient(135deg, #e11d48, #be123c)',
  },
  {
    name: 'Kumar T.',
    location: 'Dharmapuri',
    rating: 4,
    text: 'Glass cleaner works like magic on my shop windows. No streaks at all. I now use NIRAA for all cleaning in my store and home.',
    product: 'Shine Glass & Surface Cleaner',
    initials: 'KT',
    avatarBg: 'linear-gradient(135deg, #16a34a, #15803d)',
  },
];

const STATS = [
  { value: '500', suffix: '+', label: 'Happy Families', icon: '👨‍👩‍👧‍👦' },
  { value: '12', suffix: '+', label: 'Products', icon: '🧴' },
  { value: '4.6', suffix: '★', label: 'Average Rating', icon: '⭐' },
  { value: 'Same', suffix: ' Day', label: 'Local Delivery', icon: '🚚' },
];

function AnimatedNumber({ value, suffix }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isNumeric = !isNaN(parseInt(value));

  useEffect(() => {
    if (!isNumeric) { setDisplay(value); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const num = parseFloat(value);
        const steps = 40;
        let i = 0;
        const timer = setInterval(() => {
          i++;
          setDisplay((num * i / steps).toFixed(value.includes('.') ? 1 : 0));
          if (i >= steps) { setDisplay(value); clearInterval(timer); }
        }, 25);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

export default function About() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [dynamicSections, setDynamicSections] = useState([]);
  const perPage = 3;
  const maxIdx = Math.ceil(TESTIMONIALS.length / perPage) - 1;

  // Fetch CMS-managed sections for the About page
  useEffect(() => {
    fetch(`${API_BASE}/sections/about`)
      .then(r => r.ok ? r.json() : { sections: [] })
      .then(data => setDynamicSections(data.sections || []))
      .catch(() => {});
  }, []);

  const visibleTestimonials = TESTIMONIALS.slice(testimonialIdx * perPage, testimonialIdx * perPage + perPage);

  return (
    <>
      {/* Render any CMS-managed sections at the top */}
      <SectionRenderer sections={dynamicSections} />

      <main className="container page">
      <style>{`
        .about-section { margin-bottom: 52px; }

        /* Hero */
        .about-hero {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          min-height: 300px;
          display: flex;
          align-items: flex-end;
          margin-bottom: 44px;
          box-shadow: 0 24px 60px rgba(6,32,25,0.3);
        }
        .about-hero img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.25;
          mix-blend-mode: luminosity;
        }
        .about-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(0deg, rgba(6,32,25,0.97) 0%, rgba(6,32,25,0.6) 50%, transparent 100%);
        }
        .about-hero-content {
          position: relative;
          padding: 36px 32px;
          width: 100%;
        }

        /* Stats */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) { .stats-row { grid-template-columns: repeat(4, 1fr); } }

        .stat-card {
          background: #fff;
          border: 1px solid rgba(42,125,114,0.1);
          border-radius: 22px;
          padding: 22px 16px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.05);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .stat-card:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 16px 40px rgba(42,125,114,0.15); }

        /* Why Choose */
        .why-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 640px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .why-grid { grid-template-columns: repeat(3, 1fr); } }

        .why-card {
          background: #fff;
          border: 1px solid rgba(42,125,114,0.08);
          border-radius: 22px;
          padding: 24px 22px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .why-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--why-accent, var(--teal));
          opacity: 0;
          transition: opacity 0.25s;
        }
        .why-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .why-card:hover::before { opacity: 1; }

        /* Testimonials */
        .testimonial-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) { .testimonial-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .testimonial-grid { grid-template-columns: repeat(3, 1fr); } }

        .testimonial-card {
          background: #fff;
          border: 1px solid rgba(42,125,114,0.08);
          border-radius: 22px;
          padding: 24px 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.25s ease;
          animation: fadeSlideUp 0.4s ease both;
        }
        .testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(42,125,114,0.1); }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-label {
          font-size: 0.68rem;
          color: var(--teal);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .section-label::before {
          content: '';
          display: inline-block;
          width: 18px; height: 2px;
          background: var(--teal);
          border-radius: 2px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: clamp(1.4rem, 3vw, 1.8rem);
          font-weight: 900;
          color: var(--gray-800);
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }
      `}</style>

      {/* ─── HERO ─────────────────────────────── */}
      <div className="about-hero" style={{ background: 'linear-gradient(145deg, #062019, #1a4f47)' }}>
        <img src={bannerImage} alt="NIRAA banner" />
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          {/* Floating decorative */}
          <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(200,168,75,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(200,168,75,0.3)', borderRadius: 14, padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#c8a84b', fontWeight: 800 }}>✦ IIT Madras Research-Backed</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 14px', color: '#aadecd', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
            Our Story
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 900, color: '#fff',
            margin: '0 0 12px', lineHeight: 1.1,
            letterSpacing: '-0.02em', maxWidth: 580,
          }}>
            Built on Science. Designed for Everyday Living.
          </h1>
          <p style={{ color: '#aadecd', fontSize: '0.95rem', margin: '0 0 22px', maxWidth: 520, lineHeight: 1.7 }}>
            At Niraa, our products are built on science, tested for performance, and designed for everyday trust.
            Proudly serving the families of Dharmapuri and beyond.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/products" style={{
              background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))',
              color: '#fff', padding: '12px 22px', borderRadius: 14,
              fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem',
              boxShadow: '0 8px 24px rgba(42,125,114,0.4)',
            }}>Explore Products</Link>
            <Link to="/contact" style={{
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              color: '#fff', padding: '12px 22px', borderRadius: 14,
              fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem',
            }}>Contact Us</Link>
          </div>
        </div>
      </div>

      {/* ─── STATS ────────────────────────────── */}
      <div className="stats-row about-section">
        {STATS.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 900,
              color: 'var(--teal-dark)', marginBottom: 4, lineHeight: 1, letterSpacing: '-0.03em',
            }}>
              <AnimatedNumber value={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontSize: '0.77rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ─── FOUNDER SECTION ──────────────────── */}
      <section className="about-section">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Meet the Founder</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>The Brain Behind NIRAA</h2>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #062019 0%, #1a4f47 70%, #0b3d35 100%)',
          borderRadius: 28, padding: '32px 28px', position: 'relative', overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(6,32,25,0.3)',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(200,168,75,0.12)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: '20%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(74,222,128,0.08)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Avatar */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #c8a84b, #d4a843)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: '1.6rem',
              flexShrink: 0, boxShadow: '0 8px 24px rgba(200,168,75,0.4)',
              border: '3px solid rgba(255,255,255,0.2)',
            }}>
              T
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {['IIT Madras MS', 'M.Tech', 'B.E', 'R&D Specialist'].map((badge, i) => (
                  <span key={i} style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#aadecd', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700,
                    padding: '3px 10px',
                  }}>{badge}</span>
                ))}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900,
                color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em',
              }}>Tamil Selvan J</h3>
              <p style={{ color: '#aadecd', fontSize: '0.88rem', margin: '0 0 16px', fontWeight: 600 }}>
                Founder & Chief Formulator, NIRAA Products
              </p>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: '18px 20px' }}>
                <p style={{ margin: '0 0 12px', lineHeight: 1.75, color: '#e6fff7', fontSize: '0.9rem' }}>
                  Tamil Selvan J brings a strong blend of technical expertise, research experience, and industry knowledge to the development of high-quality home care and personal care products.
                </p>
                <p style={{ margin: '0 0 12px', lineHeight: 1.75, color: '#e6fff7', fontSize: '0.9rem' }}>
                  With advanced qualifications including MS from IIT Madras, he has built a solid foundation in scientific formulation, process optimization, and product performance.
                </p>
                <p style={{ margin: 0, lineHeight: 1.75, color: '#4ade80', fontSize: '0.9rem', fontWeight: 700 }}>
                  "At Niraa, our products are built on science, tested for performance, and designed for everyday trust."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE ───────────────────────── */}
      <section className="about-section">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>The NIRAA Difference</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Why Choose NIRAA?</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            We're not just another cleaning brand. Here's what makes us genuinely different.
          </p>
        </div>

        <div className="why-grid">
          {WHY_CHOOSE.map((item, i) => (
            <div key={i} className="why-card" style={{ '--why-accent': item.color }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16,
                background: item.bg, color: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, border: `1px solid ${item.color}20`,
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 900, color: 'var(--gray-800)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────── */}
      <section className="about-section">
        <div style={{
          background: 'linear-gradient(135deg, #062019 0%, #1e5c53 100%)',
          borderRadius: 28, padding: '28px 24px', marginBottom: 24,
          boxShadow: '0 20px 50px rgba(6,32,25,0.25)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
                Real Reviews
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                What Our Customers Say
              </h2>
              <p style={{ color: '#aadecd', fontSize: '0.88rem', margin: 0 }}>
                Trusted by <strong style={{ color: '#4ade80' }}>500+</strong> families across Dharmapuri & nearby areas.
              </p>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setTestimonialIdx(i => Math.max(0, i - 1))}
                disabled={testimonialIdx === 0}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: testimonialIdx === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: testimonialIdx === 0 ? 'rgba(255,255,255,0.3)' : '#fff',
                  cursor: testimonialIdx === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={() => setTestimonialIdx(i => Math.min(maxIdx, i + 1))}
                disabled={testimonialIdx === maxIdx}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: testimonialIdx === maxIdx ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: testimonialIdx === maxIdx ? 'rgba(255,255,255,0.3)' : '#fff',
                  cursor: testimonialIdx === maxIdx ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="testimonial-grid" key={testimonialIdx}>
          {visibleTestimonials.map((t, i) => (
            <div key={i} className="testimonial-card" style={{ animationDelay: `${i * 0.08}s` }}>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} style={{ color: s <= t.rating ? '#f59e0b' : '#e5e7eb', fontSize: '0.95rem' }}>★</span>
                ))}
              </div>

              {/* Quote */}
              <p style={{
                color: 'var(--gray-600)', fontSize: '0.88rem', lineHeight: 1.7,
                margin: 0, flex: 1, fontStyle: 'italic',
                borderLeft: '3px solid rgba(42,125,114,0.2)',
                paddingLeft: 12,
              }}>
                "{t.text}"
              </p>

              {/* Product */}
              <div style={{
                fontSize: '0.7rem', color: 'var(--teal-dark)', fontWeight: 700,
                background: '#f0faf8', padding: '5px 12px', borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', gap: 4,
                alignSelf: 'flex-start',
                border: '1px solid rgba(42,125,114,0.12)',
              }}>
                🛒 {t.product}
              </div>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, borderTop: '1px solid var(--gray-100)' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: t.avatarBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 900, fontSize: '0.82rem',
                  flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--gray-800)', fontSize: '0.88rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    📍 {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 18 }}>
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setTestimonialIdx(i)}
              style={{
                width: i === testimonialIdx ? 24 : 8, height: 8,
                borderRadius: 4, border: 'none', cursor: 'pointer',
                background: i === testimonialIdx ? 'var(--teal)' : 'rgba(42,125,114,0.2)',
                transition: 'all 0.3s',
                padding: 0,
              }}
            />
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────── */}
      <section style={{ marginBottom: 20 }}>
        <div style={{
          background: 'linear-gradient(135deg, #062019 0%, #0d7a6a 60%, #0b3d35 100%)',
          color: '#fff', borderRadius: 28, padding: '40px 32px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(6,32,25,0.3)',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(200,168,75,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: '25%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(74,222,128,0.08)' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 12 }}>
              ⚡ Try NIRAA Today
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              fontWeight: 900, marginBottom: 12,
              letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              Powerful Cleaning.<br />Scientifically Formulated.
            </div>
            <p style={{ color: '#aadecd', fontWeight: 500, fontSize: '0.92rem', marginBottom: 26, maxWidth: 480, margin: '0 auto 26px', lineHeight: 1.7 }}>
              We combine scientific expertise with real-world performance to create high-quality home care solutions you can trust every day.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/products" style={{
                background: 'linear-gradient(135deg, #c8a84b, #d4a843)',
                color: '#fff', padding: '14px 28px', borderRadius: 16,
                fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem',
                boxShadow: '0 8px 24px rgba(200,168,75,0.35)',
              }}>Browse Products</Link>
              <Link to="/contact" style={{
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '14px 28px', borderRadius: 16,
                fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem',
              }}>Get in Touch</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}