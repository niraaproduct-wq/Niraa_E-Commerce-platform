import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiDroplet, FiHeart, FiTruck, FiAward, FiStar, FiUsers } from 'react-icons/fi';
import bannerImage from '../assets/images/banner.jpeg';

const WHY_CHOOSE = [
  {
    icon: <FiShield size={28} />,
    title: 'Safe for Families',
    desc: 'All NIRAA products are formulated without harsh chemicals. Gentle enough for homes with kids and pets, yet powerful against dirt and germs.',
    color: '#0d7a6a',
  },
  {
    icon: <FiDroplet size={28} />,
    title: 'Eco-Friendly Formulas',
    desc: 'We use biodegradable ingredients and offer refill packs to reduce plastic waste. Cleaning your home shouldn\'t cost the planet.',
    color: '#2563eb',
  },
  {
    icon: <FiAward size={28} />,
    title: '99.9% Germ Kill',
    desc: 'Our clinically tested formulas eliminate 99.9% of germs and bacteria, protecting your family from infections and illness.',
    color: '#c8a84b',
  },
  {
    icon: <FiTruck size={28} />,
    title: 'Fast Local Delivery',
    desc: 'Serving Dharmapuri and nearby areas with quick delivery. Order via WhatsApp and get your products the same day or next day.',
    color: '#16a34a',
  },
  {
    icon: <FiHeart size={28} />,
    title: 'Made with Care',
    desc: 'Every product is carefully formulated and quality-tested to ensure it delivers real, visible cleaning results that you can trust.',
    color: '#e11d48',
  },
  {
    icon: <FiUsers size={28} />,
    title: 'Community Focused',
    desc: 'We\'re a local brand serving local families. Your feedback directly shapes our products and services. We grow together.',
    color: '#7c3aed',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya M.',
    location: 'Dharmapuri',
    rating: 5,
    text: 'The floor cleaner leaves my marble floors so shiny! The lemon fragrance stays for hours. Best local brand I\'ve used.',
    product: 'Floor Cleaner – Lemon Fresh',
  },
  {
    name: 'Rajesh K.',
    location: 'Pennagaram',
    rating: 5,
    text: 'Ordered the Complete Home Combo — superb value! All 6 products work great. My wife loves the fabric conditioner especially.',
    product: 'Complete Home Combo',
  },
  {
    name: 'Meena S.',
    location: 'Dharmapuri',
    rating: 4,
    text: 'The toilet cleaner is really strong but doesn\'t have that harsh chemical smell. My bathroom has never been cleaner. Will order again.',
    product: 'Toilet Cleaner – Power Ultra',
  },
  {
    name: 'Arjun V.',
    location: 'Harur',
    rating: 5,
    text: 'Delivery was very fast. I ordered via WhatsApp and got my products the same evening. Quality is better than big brands at half the price.',
    product: 'Kitchen Sparkle Duo',
  },
  {
    name: 'Lakshmi R.',
    location: 'Palacode',
    rating: 5,
    text: 'The Eco Green detergent is so gentle on my silk sarees but cleans cotton clothes perfectly. Finally a detergent I can trust for everything!',
    product: 'Detergent Liquid – Eco Green',
  },
  {
    name: 'Kumar T.',
    location: 'Dharmapuri',
    rating: 4,
    text: 'Glass cleaner works like magic on my shop windows. No streaks at all. I now use NIRAA for all cleaning in my store and home.',
    product: 'Shine Glass & Surface Cleaner',
  },
];

const STATS = [
  { value: '500+', label: 'Happy Families' },
  { value: '12+', label: 'Products' },
  { value: '4.6★', label: 'Average Rating' },
  { value: 'Same Day', label: 'Local Delivery' },
];

export default function About() {
  return (
    <main className="container page">
      <style>{`
        .about-hero {
          position: relative; border-radius: 24px; overflow: hidden;
          min-height: 260px; display: flex; align-items: flex-end;
          margin-bottom: 36px;
        }
        .about-hero img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; opacity: 0.3;
        }
        .about-hero-content {
          position: relative; padding: 32px 28px;
          background: linear-gradient(0deg, rgba(11,35,31,0.95) 0%, transparent 100%);
          width: 100%;
        }
        .stats-row {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
          margin-bottom: 36px;
        }
        @media (min-width: 640px) { .stats-row { grid-template-columns: repeat(4, 1fr); } }
        .why-grid {
          display: grid; grid-template-columns: 1fr; gap: 14px;
          margin-bottom: 36px;
        }
        @media (min-width: 640px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .why-grid { grid-template-columns: repeat(3, 1fr); } }
        .testimonial-grid {
          display: grid; grid-template-columns: 1fr; gap: 14px;
          margin-bottom: 36px;
        }
        @media (min-width: 640px) { .testimonial-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .testimonial-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>

      {/* ─── HERO BANNER ─────────────────────── */}
      <div className="about-hero" style={{ background: 'linear-gradient(145deg, #0b231f, #1a4f47)' }}>
        <img src={bannerImage} alt="NIRAA banner" />
        <div className="about-hero-content">
          <div style={{
            display: 'inline-block', background: '#c8a84b', color: '#fff',
            borderRadius: 999, fontSize: '0.7rem', fontWeight: 800,
            padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
          }}>Our Story</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.15,
          }}>
            Built on Science. Designed for Everyday Living.
          </h1>
          <p style={{ color: '#aadecd', fontSize: '0.95rem', margin: '0 0 16px', maxWidth: 500 }}>
            At Niraa, our products are built on science, tested for performance, and designed for everyday trust.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/products" style={{
              background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))', color: '#fff',
              padding: '11px 20px', borderRadius: 14, fontWeight: 800, textDecoration: 'none', fontSize: '0.88rem',
            }}>Explore Products</Link>
            <Link to="/contact" style={{
              background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)',
              color: '#fff', padding: '11px 20px', borderRadius: 14, fontWeight: 800, textDecoration: 'none', fontSize: '0.88rem',
            }}>Contact Us</Link>
          </div>
        </div>
      </div>

      {/* ─── STATS ROW ───────────────────────── */}
      <div className="stats-row">
        {STATS.map((s, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px solid rgba(42,125,114,0.12)',
            borderRadius: 18, padding: '18px 16px', textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900,
              color: 'var(--teal-dark)', marginBottom: 4,
            }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── OUR STORY ───────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          display: 'grid', gap: 14,
        }}>
          <div style={{
            background: '#fff', border: '1px solid rgba(42,125,114,0.12)',
            borderRadius: 20, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              fontSize: '0.72rem', color: 'var(--teal)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
            }}>Our Story</div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800,
              color: 'var(--gray-800)', marginBottom: 12,
            }}>Who We Are</h2>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, margin: '0 0 12px' }}>
              NIRAA PRODUCTS is a research-driven home care brand founded by Tamil Selvan J,
              B.E | M.Tech | MS (IIT Madras), an R&D and production specialist with deep expertise in
              scientific formulation, process optimization, and industrial production.
            </p>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, margin: 0 }}>
              With experience across both research and manufacturing environments, we transform scientific
              innovation into practical, market-ready solutions that deliver consistent cleaning performance
              for real Indian homes.
            </p>
          </div>

          <div style={{
            background: '#fff', border: '1px solid rgba(42,125,114,0.12)',
            borderRadius: 20, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              fontSize: '0.72rem', color: 'var(--teal)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
            }}>Our Mission</div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800,
              color: 'var(--gray-800)', marginBottom: 12,
            }}>What Drives Us</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { emoji: '🧪', text: 'Manufactured with R&D precision and performance-first formulation' },
                { emoji: '🇮🇳', text: 'Made in India with globally aligned quality standards' },
                { emoji: '✔', text: 'Safe for daily use with dependable, repeatable results' },
                { emoji: '🤝', text: 'Powerful cleaning solutions designed for everyday trust' },
              ].map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#f0faf8', borderRadius: 14, padding: '12px 16px',
                  border: '1px solid rgba(42,125,114,0.08)',
                }}>
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{m.emoji}</span>
                  <span style={{ color: 'var(--gray-700)', fontSize: '0.9rem', fontWeight: 600 }}>{m.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOUNDER SPOTLIGHT ───────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          background: 'linear-gradient(135deg, #0b231f 0%, #1e5c53 100%)',
          borderRadius: 24,
          padding: '26px 22px',
          color: '#fff',
          boxShadow: '0 10px 30px rgba(11,35,31,0.2)',
        }}>
          <div style={{
            fontSize: '0.72rem',
            color: '#4ade80',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 6,
          }}>
            Founder Spotlight
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 8px',
          }}>
            Tamil Selvan J
          </h2>

          <p style={{ color: '#aadecd', fontSize: '0.9rem', margin: '0 0 14px', fontWeight: 700 }}>
            B.E | M.Tech | MS (IIT Madras) | R&D & Production Specialist
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 16,
            padding: '16px 18px',
          }}>
            <p style={{ margin: '0 0 10px', lineHeight: 1.7, color: '#e6fff7', fontSize: '0.92rem' }}>
              Tamil Selvan J brings a strong blend of technical expertise, research experience, and industry knowledge
              to the development of high-quality home care and personal care products.
            </p>
            <p style={{ margin: '0 0 10px', lineHeight: 1.7, color: '#e6fff7', fontSize: '0.92rem' }}>
              With advanced qualifications including MS from IIT Madras, he has built a solid foundation in scientific
              formulation, process optimization, and product performance. His exposure to globally aligned standards
              enables NIRAA to deliver consistent and dependable results.
            </p>
            <p style={{ margin: 0, lineHeight: 1.7, color: '#e6fff7', fontSize: '0.92rem', fontWeight: 600 }}>
              At Niraa, our products are built on science, tested for performance, and designed for everyday trust.
            </p>
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE NIRAA? ───────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            fontSize: '0.72rem', color: 'var(--teal)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
          }}>The NIRAA Difference</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
            fontWeight: 900, color: 'var(--gray-800)', marginBottom: 8,
          }}>Why Choose NIRAA?</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', maxWidth: 560, margin: '0 auto' }}>
            We're not just another cleaning brand. Here's what makes us different.
          </p>
        </div>

        <div className="why-grid">
          {WHY_CHOOSE.map((item, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid rgba(42,125,114,0.1)',
              borderRadius: 20, padding: '24px 22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.22s ease', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(42,125,114,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${item.color}15`, color: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>{item.icon}</div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 800,
                color: 'var(--gray-800)', marginBottom: 8,
              }}>{item.title}</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CUSTOMER TESTIMONIALS ───────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          background: 'linear-gradient(135deg, #0b231f 0%, #1e5c53 100%)',
          borderRadius: 24, padding: '28px 24px', marginBottom: 20,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.72rem', color: '#4ade80', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
            }}>Real Reviews</div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
              fontWeight: 900, color: '#fff', margin: '0 0 8px',
            }}>What Our Customers Say</h2>
            <p style={{ color: '#aadecd', fontSize: '0.88rem', margin: 0 }}>
              Trusted by 500+ families across Dharmapuri & nearby areas.
            </p>
          </div>
        </div>

        <div className="testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid rgba(42,125,114,0.1)',
              borderRadius: 20, padding: '22px 20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} size={14}
                    fill={s <= t.rating ? '#f59e0b' : 'none'}
                    color={s <= t.rating ? '#f59e0b' : '#d1d5db'}
                  />
                ))}
              </div>

              {/* Quote */}
              <p style={{
                color: 'var(--gray-600)', fontSize: '0.88rem', lineHeight: 1.65,
                margin: '0 0 14px', flex: 1, fontStyle: 'italic',
              }}>
                "{t.text}"
              </p>

              {/* Product tag */}
              <div style={{
                fontSize: '0.7rem', color: 'var(--teal-dark)', fontWeight: 700,
                background: '#f0faf8', padding: '4px 10px', borderRadius: 999,
                display: 'inline-block', marginBottom: 12, alignSelf: 'flex-start',
                border: '1px solid rgba(42,125,114,0.1)',
              }}>
                🛒 {t.product}
              </div>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--gray-800)', fontSize: '0.88rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>📍 {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ──────────────────────── */}
      <section style={{ marginBottom: 20 }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--teal-dark) 0%, #0b231f 100%)',
          color: '#fff', borderRadius: 22, padding: '28px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
            fontWeight: 900, marginBottom: 8,
          }}>Powerful Cleaning. Scientifically Formulated.</div>
          <div style={{ color: '#aadecd', fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>
            At NIRAA PRODUCTS, we combine scientific expertise with real-world performance to create
            high-quality home care solutions you can trust every day.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" style={{
              background: '#c8a84b', color: '#fff',
              padding: '12px 24px', borderRadius: 14, fontWeight: 800, textDecoration: 'none',
            }}>Browse Products</Link>
            <Link to="/contact" style={{
              background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)',
              color: '#fff', padding: '12px 24px', borderRadius: 14, fontWeight: 800, textDecoration: 'none',
            }}>Get in Touch</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
