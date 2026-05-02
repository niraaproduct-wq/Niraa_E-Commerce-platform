import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import EnhancedProductCard from '../components/EnhancedProductCard';
import { formatPrice } from '../utils/formatPrice.js';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import bannerImage from '../assets/images/banner.jpeg';
import { CATEGORIES } from '../utils/categories.js';
import { getProducts } from '../utils/productApi.js';
import { useAdmin } from '../context/AdminContext';
import { FaEdit, FaPlus, FaTrash, FaSave, FaTimes, FaWhatsapp, FaLeaf, FaShieldAlt, FaTruck, FaStar } from 'react-icons/fa';
import SectionRenderer from '../components/SectionRenderer';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? (import.meta.env.VITE_API_BASE_URL.endsWith('/api') ? import.meta.env.VITE_API_BASE_URL : `${import.meta.env.VITE_API_BASE_URL}/api`)
  : '/api';

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --teal:        #2a7d72;
    --teal-dark:   #1a5048;
    --teal-light:  #e8f7f5;
    --gold:        #c8a84b;
    --gold-light:  #fdf8ec;
    --green:       #22c55e;
    --gray-900:    #0f1a18;
    --gray-800:    #1c2b28;
    --gray-700:    #2d4440;
    --gray-500:    #6b8880;
    --gray-300:    #b8ccc9;
    --gray-100:    #f0f5f4;
    --white:       #ffffff;
    --font-display: 'Fraunces', Georgia, serif;
    --font-body:    'DM Sans', system-ui, sans-serif;
    --radius-sm:   10px;
    --radius-md:   18px;
    --radius-lg:   28px;
    --shadow-sm:   0 2px 12px rgba(15,26,24,0.06);
    --shadow-md:   0 8px 32px rgba(15,26,24,0.10);
    --shadow-lg:   0 20px 60px rgba(15,26,24,0.14);
    --transition:  0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  * { box-sizing: border-box; }

  body {
    font-family: var(--font-body);
    background: #f7faf9;
    color: var(--gray-800);
  }

  /* ── UTILITY ── */
  .niraa-page { padding: 0 0 60px; }

  /* ── HERO ── */
  .niraa-hero {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    min-height: 92vh;
    position: relative;
    overflow: hidden;
  }
  @media (min-width: 900px) {
    .niraa-hero { grid-template-columns: 1fr 1fr; min-height: 88vh; }
  }

  .niraa-hero__left {
    background: var(--gray-900);
    padding: 64px 48px 56px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 28px;
    position: relative;
    overflow: hidden;
  }
  .niraa-hero__left::before {
    content: '';
    position: absolute;
    top: -120px; left: -80px;
    width: 440px; height: 440px;
    background: radial-gradient(circle, rgba(42,125,114,0.3) 0%, transparent 70%);
    pointer-events: none;
  }
  .niraa-hero__left::after {
    content: '';
    position: absolute;
    bottom: -60px; right: -40px;
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(200,168,75,0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(42,125,114,0.2);
    border: 1px solid rgba(42,125,114,0.4);
    color: #4ade80;
    padding: 7px 16px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    width: fit-content;
    backdrop-filter: blur(8px);
    animation: fadeSlideDown 0.7s ease both;
  }

  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(3rem, 6vw, 5.5rem);
    font-weight: 900;
    color: var(--white);
    line-height: 1.0;
    margin: 0;
    animation: fadeSlideUp 0.7s 0.15s ease both;
  }
  .hero-title span {
    color: var(--gold);
    font-style: italic;
  }

  .hero-subtitle {
    color: var(--gray-300);
    font-size: clamp(0.95rem, 1.8vw, 1.05rem);
    font-weight: 400;
    line-height: 1.65;
    max-width: 480px;
    animation: fadeSlideUp 0.7s 0.25s ease both;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    animation: fadeSlideUp 0.7s 0.35s ease both;
  }

  .btn-wa {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    background: #25D366;
    color: #fff;
    padding: 14px 24px;
    border-radius: var(--radius-sm);
    font-weight: 700;
    font-size: 0.95rem;
    text-decoration: none;
    transition: var(--transition);
    box-shadow: 0 4px 20px rgba(37,211,102,0.35);
  }
  .btn-wa:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(37,211,102,0.5);
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    color: var(--white);
    padding: 14px 24px;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    border: 1.5px solid rgba(255,255,255,0.25);
    transition: var(--transition);
    backdrop-filter: blur(4px);
  }
  .btn-ghost:hover {
    border-color: rgba(255,255,255,0.6);
    background: rgba(255,255,255,0.08);
    transform: translateY(-2px);
  }

  /* ── HERO RIGHT (deal card) ── */
  .niraa-hero__right {
    position: relative;
    overflow: hidden;
    min-height: 480px;
  }
  .hero-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(10,28,24,0.97) 0%,
      rgba(10,28,24,0.55) 50%,
      rgba(10,28,24,0.15) 100%
    );
  }
  .hero-deal {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 32px;
  }
  .deal-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--gold);
    color: #fff;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 800;
    padding: 5px 14px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .deal-name {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 900;
    color: #fff;
    line-height: 1.15;
    margin: 0 0 8px;
  }
  .deal-items {
    color: rgba(170,222,205,0.85);
    font-size: 0.83rem;
    margin-bottom: 16px;
    font-weight: 400;
  }
  .deal-pricing {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .deal-price-main {
    font-family: var(--font-display);
    font-size: 2.6rem;
    font-weight: 900;
    color: #4ade80;
    line-height: 1;
  }
  .deal-price-orig {
    text-decoration: line-through;
    color: #7fa99e;
    font-size: 1.1rem;
  }
  .deal-save-chip {
    background: #16a34a;
    color: #fff;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    padding: 4px 12px;
  }
  .deal-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .deal-btn-primary {
    background: linear-gradient(135deg, var(--teal), var(--teal-dark));
    color: #fff;
    padding: 13px 16px;
    border-radius: var(--radius-sm);
    font-weight: 800;
    text-decoration: none;
    font-size: 0.9rem;
    text-align: center;
    transition: var(--transition);
    box-shadow: 0 4px 16px rgba(42,125,114,0.4);
  }
  .deal-btn-primary:hover { transform: translateY(-2px); filter: brightness(1.1); }
  .deal-btn-wa {
    background: #25D366;
    color: #fff;
    padding: 13px 16px;
    border-radius: var(--radius-sm);
    font-weight: 800;
    text-decoration: none;
    font-size: 0.9rem;
    text-align: center;
    transition: var(--transition);
    box-shadow: 0 4px 16px rgba(37,211,102,0.4);
  }
  .deal-btn-wa:hover { transform: translateY(-2px); filter: brightness(1.1); }

  /* ── TRUST STRIP ── */
  .trust-strip {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    background: rgba(42,125,114,0.1);
    border-radius: var(--radius-md);
    overflow: hidden;
    margin: 0 0 48px;
  }
  @media (min-width: 640px) { .trust-strip { grid-template-columns: repeat(4, 1fr); } }

  .trust-item {
    background: #fff;
    padding: 22px 18px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    transition: background 0.2s;
  }
  .trust-item:hover { background: var(--teal-light); }
  .trust-icon {
    width: 44px; height: 44px;
    background: var(--teal-light);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    flex-shrink: 0;
    transition: background 0.2s;
  }
  .trust-item:hover .trust-icon { background: rgba(42,125,114,0.2); }
  .trust-label { font-weight: 700; color: var(--gray-800); font-size: 0.88rem; margin-bottom: 3px; }
  .trust-desc { color: var(--gray-500); font-size: 0.75rem; line-height: 1.4; }

  /* ── SECTION WRAPPER ── */
  .niraa-section { padding: 0 24px; max-width: 1280px; margin: 0 auto 56px; }
  @media (min-width: 1280px) { .niraa-section { padding: 0; } }

  /* ── SECTION HEADING ── */
  .sec-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .sec-eyebrow {
    font-size: 0.7rem;
    color: var(--teal);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sec-eyebrow::before {
    content: '';
    display: block;
    width: 20px;
    height: 2px;
    background: var(--teal);
    border-radius: 99px;
  }
  .sec-title {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 800;
    color: var(--gray-900);
    margin: 0;
    line-height: 1.15;
  }
  .sec-cta {
    color: var(--teal-dark);
    font-weight: 700;
    font-size: 0.85rem;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 5px;
    border-bottom: 2px solid var(--teal);
    padding-bottom: 2px;
    transition: gap 0.2s, color 0.2s;
  }
  .sec-cta:hover { gap: 9px; color: var(--teal); }

  /* ── CATEGORIES ── */
  .cat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (min-width: 560px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 900px) { .cat-grid { grid-template-columns: repeat(5, 1fr); } }

  .cat-card {
    background: #fff;
    border: 1.5px solid rgba(42,125,114,0.1);
    border-radius: var(--radius-md);
    padding: 22px 14px 18px;
    text-align: center;
    cursor: pointer;
    text-decoration: none;
    display: block;
    transition: var(--transition);
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
  }
  .cat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--teal-light), transparent);
    opacity: 0;
    transition: opacity 0.25s;
  }
  .cat-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); border-color: rgba(42,125,114,0.3); }
  .cat-card:hover::before { opacity: 1; }
  .cat-icon { font-size: 2.2rem; margin-bottom: 10px; display: block; transition: transform 0.3s; }
  .cat-card:hover .cat-icon { transform: scale(1.15) rotate(-4deg); }
  .cat-name { font-weight: 800; color: var(--gray-800); font-size: 0.9rem; margin-bottom: 3px; }
  .cat-desc { font-size: 0.72rem; color: var(--gray-500); margin-bottom: 10px; line-height: 1.4; }
  .cat-count { font-size: 0.72rem; color: var(--teal); font-weight: 700; }

  /* ── FEATURE BANNER ── */
  .feature-banner {
    border-radius: var(--radius-md);
    padding: 20px 22px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    overflow: hidden;
  }
  .feature-banner::after {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    pointer-events: none;
  }
  .feature-banner-icon {
    font-size: 2rem;
    flex-shrink: 0;
    width: 56px; height: 56px;
    background: rgba(255,255,255,0.15);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .feature-banner-text { color: var(--gray-600); font-size: 0.9rem; line-height: 1.6; }

  /* ── PROD GRID ── */
  .prod-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  @media (min-width: 640px) { .prod-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1024px) { .prod-grid { grid-template-columns: repeat(4, 1fr); } }

  /* ── COMBO SECTION ── */
  .combo-header {
    background: linear-gradient(135deg, var(--gray-900) 0%, #1e5c53 100%);
    border-radius: var(--radius-lg);
    padding: 36px 32px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .combo-header::before {
    content: '';
    position: absolute;
    top: -80px; right: -60px;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(42,125,114,0.4) 0%, transparent 70%);
  }
  .combo-header::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 60px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,168,75,0.2) 0%, transparent 70%);
  }
  .combo-header-inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }
  .combo-eyebrow { font-size: 0.7rem; color: #4ade80; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }
  .combo-title { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 900; color: #fff; margin: 0 0 8px; }
  .combo-subtitle { color: #aadecd; font-size: 0.9rem; }
  .combo-cta {
    background: var(--gold);
    color: #fff;
    padding: 12px 22px;
    border-radius: var(--radius-sm);
    font-weight: 800;
    text-decoration: none;
    font-size: 0.88rem;
    flex-shrink: 0;
    transition: var(--transition);
    box-shadow: 0 4px 16px rgba(200,168,75,0.4);
  }
  .combo-cta:hover { transform: translateY(-2px); filter: brightness(1.08); }

  .combo-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 640px) { .combo-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1000px) { .combo-grid { grid-template-columns: repeat(3, 1fr); } }

  /* ── STATS ROW ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: rgba(42,125,114,0.12);
    border-radius: var(--radius-md);
    overflow: hidden;
    margin-bottom: 56px;
  }
  .stat-cell {
    background: #fff;
    padding: 28px 20px;
    text-align: center;
  }
  .stat-num {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: var(--teal-dark);
    line-height: 1;
    margin-bottom: 6px;
  }
  .stat-label { font-size: 0.8rem; color: var(--gray-500); font-weight: 500; }

  /* ── TESTIMONIALS ── */
  .testimonials-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 56px;
  }
  @media (min-width: 640px) { .testimonials-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 900px) { .testimonials-grid { grid-template-columns: repeat(3, 1fr); } }

  .testimonial-card {
    background: #fff;
    border: 1px solid rgba(42,125,114,0.1);
    border-radius: var(--radius-md);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
  }
  .testimonial-card::before {
    content: '"';
    position: absolute;
    top: -8px; right: 16px;
    font-family: var(--font-display);
    font-size: 8rem;
    color: var(--teal-light);
    font-weight: 900;
    line-height: 1;
    pointer-events: none;
  }
  .test-stars { display: flex; gap: 3px; color: var(--gold); font-size: 0.85rem; margin-bottom: 12px; }
  .test-text { color: var(--gray-700); font-size: 0.9rem; line-height: 1.65; margin-bottom: 16px; font-style: italic; }
  .test-author { display: flex; align-items: center; gap: 12px; }
  .test-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--teal), var(--teal-dark));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 0.9rem;
    flex-shrink: 0;
  }
  .test-name { font-weight: 700; color: var(--gray-800); font-size: 0.88rem; }
  .test-location { font-size: 0.72rem; color: var(--gray-500); }

  /* ── BOTTOM CTA ── */
  .bottom-cta {
    background: linear-gradient(135deg, var(--gray-900) 0%, var(--teal-dark) 100%);
    color: #fff;
    border-radius: var(--radius-lg);
    padding: 48px 40px;
    text-align: center;
    position: relative;
    overflow: hidden;
    margin: 0 24px;
  }
  @media (min-width: 900px) { .bottom-cta { margin: 0; } }
  .bottom-cta::before {
    content: '';
    position: absolute;
    top: -100px; left: 50%;
    transform: translateX(-50%);
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(42,125,114,0.3) 0%, transparent 60%);
    pointer-events: none;
  }
  .bottom-cta-title {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 900;
    color: #fff;
    margin: 0 0 12px;
    position: relative;
  }
  .bottom-cta-sub {
    color: #aadecd;
    font-size: 1rem;
    margin-bottom: 28px;
    font-weight: 400;
    position: relative;
  }
  .bottom-cta-btns {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
  }

  /* ── ADMIN CONTROLS ── */
  .admin-panel {
    position: fixed;
    top: 20px; right: 20px;
    background: rgba(42,125,114,0.95);
    color: #fff;
    padding: 18px 16px;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1.5px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(12px);
    min-width: 180px;
  }
  .admin-panel-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.7;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.15);
  }
  .admin-btn {
    background: rgba(255,255,255,0.15);
    border: none;
    color: #fff;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
    font-family: var(--font-body);
  }
  .admin-btn:hover { background: rgba(255,255,255,0.28); }
  .admin-btn.gold { background: var(--gold); }
  .admin-btn.gold:hover { background: #b8982a; }

  /* ── ANIMATIONS ── */
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.5); opacity: 0; }
  }

  /* ── FLOATING WA BUTTON ── */
  .wa-float {
    position: fixed;
    bottom: 28px; right: 28px;
    width: 60px; height: 60px;
    background: #25D366;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 1.6rem;
    text-decoration: none;
    box-shadow: 0 6px 24px rgba(37,211,102,0.45);
    z-index: 1000;
    transition: var(--transition);
  }
  .wa-float::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid #25D366;
    animation: pulse-ring 1.8s ease infinite;
  }
  .wa-float:hover { transform: scale(1.12); box-shadow: 0 10px 32px rgba(37,211,102,0.6); }
`;

/* ─── TRUST DATA ────────────────────────────────────────────── */
const TRUSTS = [
  { icon: '🌿', title: 'Eco-Friendly', desc: 'Safe for families & the planet.' },
  { icon: '🛡️', title: '99.9% Germ Kill', desc: 'Clinically tested formulas.' },
  { icon: '💰', title: 'Best Price Guaranteed', desc: 'Combo deals save up to 38%.' },
  { icon: '🚚', title: 'Local Delivery', desc: 'Serving Dharmapuri & nearby areas.' },
];

const TESTIMONIALS = [
  { name: 'Priya M.', location: 'Dharmapuri', text: 'The floor cleaner leaves my marble floors sparkling with zero effort. I\'ve tried many brands but NIRAA is in a class of its own.', stars: 5 },
  { name: 'Kavitha R.', location: 'Krishnagiri', text: 'Combo offer saved me a lot. The toilet cleaner works instantly — thick gel that actually sticks under the rim. Highly recommended!', stars: 5 },
  { name: 'Rajan S.', location: 'Dharmapuri', text: 'Eco-friendly and effective — that\'s rare! My kids are safe around these products and my home has never smelled fresher.', stars: 5 },
];

/* ─── SECTION HEADING ─────────────────────────────────────── */
const SectionHeading = ({ label, title, cta, to, onEdit, onDelete, isEditing, editingItem, item }) => {
  const { isAdminMode } = useAdmin();
  const isCurrentlyEditing = isEditing && editingItem?._id === item?._id;

  return (
    <div className="sec-head">
      <div>
        <div className="sec-eyebrow">{label}</div>
        {isCurrentlyEditing ? (
          <input
            type="text"
            defaultValue={title}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem,3vw,2rem)',
              fontWeight: 800,
              color: 'var(--gray-900)',
              border: '2px solid var(--teal)',
              borderRadius: 8,
              padding: '6px 12px',
              width: '100%',
            }}
          />
        ) : (
          <h2 className="sec-title">{title}</h2>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {isAdminMode && !isEditing && (
          <>
            <button onClick={() => onEdit(item)} style={{
              background: 'var(--teal)', color: '#fff', border: 'none',
              padding: '6px 14px', borderRadius: 20, fontSize: '0.72rem',
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font-body)',
            }}>
              <FaEdit size={10} /> Edit
            </button>
            <button onClick={() => onDelete(item?._id)} style={{
              background: '#ef4444', color: '#fff', border: 'none',
              padding: '6px 14px', borderRadius: 20, fontSize: '0.72rem',
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font-body)',
            }}>
              <FaTrash size={10} /> Delete
            </button>
          </>
        )}
        {isCurrentlyEditing && (
          <>
            <button onClick={() => { }} style={{
              background: '#22c55e', color: '#fff', border: 'none',
              padding: '6px 14px', borderRadius: 20, fontSize: '0.72rem',
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font-body)',
            }}>
              <FaSave size={10} /> Save
            </button>
            <button onClick={() => onEdit(null)} style={{
              background: '#ef4444', color: '#fff', border: 'none',
              padding: '6px 14px', borderRadius: 20, fontSize: '0.72rem',
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font-body)',
            }}>
              <FaTimes size={10} /> Cancel
            </button>
          </>
        )}
        {!isAdminMode && cta && to && (
          <Link to={to} className="sec-cta">{cta} →</Link>
        )}
      </div>
    </div>
  );
};

/* ─── ADMIN CONTROLS ──────────────────────────────────────── */
const AdminControls = ({ onAddBanner, onAddProduct }) => {
  const { isAdminMode } = useAdmin();
  if (!isAdminMode) return null;
  return (
    <div className="admin-panel">
      <div className="admin-panel-label">⚙ Admin Controls</div>
      <button className="admin-btn gold" onClick={onAddBanner}>🎯 Add Banner</button>
      <button className="admin-btn" onClick={onAddProduct}>🛍️ Add Product</button>
    </div>
  );
};

/* ─── ANIMATED COUNTER ────────────────────────────────────── */
function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

const StatCounter = ({ num, suffix, label }) => {
  const { count, ref } = useCounter(num);
  return (
    <div className="stat-cell" ref={ref}>
      <div className="stat-num">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

/* ─── MAIN PAGE ───────────────────────────────────────────── */
export default function EnhancedHome() {
  const { isAdminMode, isEditing, editingItem, startEditing, stopEditing } = useAdmin();
  const [combos, setCombos] = useState([]);
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicSections, setDynamicSections] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getProducts({ limit: 100 });
        const prods = data?.products || [];
        setCombos(prods.filter(p => p.isCombo));
        setIndividuals(prods.filter(p => !p.isCombo));
      } catch (err) {
        console.error("EnhancedHome fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSections = async () => {
      try {
        const res = await fetch(`${API_BASE}/sections/home`);
        if (res.ok) {
          const data = await res.json();
          setDynamicSections(data.sections || []);
        }
      } catch (err) {
        console.error("Home sections fetch error:", err);
      }
    };

    fetchAll();
    fetchSections();
  }, []);

  const mainCombo = combos.find(c => c._id === 'combo-complete-home') || combos[0];
  const waText = `Hello NIRAA, I want to order the Complete Home Combo. Please contact me!`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  const handleEdit = (item) => { item ? startEditing(item, item.type || 'content') : stopEditing(); };
  const handleDelete = (itemId) => { if (window.confirm('Delete this item?')) console.log('Deleting:', itemId); };
  const handleAddBanner = () => console.log('Adding banner');
  const handleAddProduct = () => console.log('Adding product');

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600, color: 'var(--teal)', fontFamily: 'var(--font-display)' }}>Loading NIRAA Premium Experience...</div>;

  return (
    <>
      <style>{CSS}</style>

      <main className="niraa-page">
        <AdminControls onAddBanner={handleAddBanner} onAddProduct={handleAddProduct} />

        {/* ── CMS DYNAMIC SECTIONS ── */}
        <SectionRenderer sections={dynamicSections} />

        {/* ── FLOATING WA BUTTON ── */}
        <a href={waLink} target="_blank" rel="noreferrer" className="wa-float" title="Order on WhatsApp">
          <FaWhatsapp />
        </a>

        {/* ════════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <section className="niraa-hero">
          {/* Left: dark panel with headline */}
          <div className="niraa-hero__left">
            <div className="hero-badge">
              <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
              Dharmapuri's Most Trusted Cleaning Brand
            </div>

            <h1 className="hero-title">
              Clean Home,<br />
              <span>Happy</span><br />
              Family.
            </h1>

            <p className="hero-subtitle">
              Eco-friendly cleaning products formulated for Indian homes — delivering clinically proven results for every surface, every room.
            </p>

            <div className="hero-actions">
              <a className="btn-wa" href={waLink} target="_blank" rel="noreferrer">
                <FaWhatsapp /> Order via WhatsApp
              </a>
              <Link className="btn-ghost" to="/products">Browse All Products</Link>
            </div>

            {/* Mini trust badges inside hero */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['🌿 Eco-Safe', '🛡️ 99.9% Germ Kill', '🚚 Local Delivery'].map(t => (
                <span key={t} style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
                  padding: '5px 12px',
                  borderRadius: 999,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Right: hero combo card */}
          {mainCombo && (
            <div className="niraa-hero__right">
              <img src={bannerImage} alt="NIRAA cleaning products" className="hero-img" />
              <div className="hero-overlay" />
              <div className="hero-deal">
                <div className="deal-chip">🏆 Best Value Deal</div>
                <h2 className="deal-name">{mainCombo.name}</h2>
                <div className="deal-items">{mainCombo.comboItems?.join(' • ')}</div>
                <div className="deal-pricing">
                  <span className="deal-price-main">{formatPrice(mainCombo.price)}</span>
                  <span className="deal-price-orig">{formatPrice(mainCombo.originalPrice)}</span>
                  <span className="deal-save-chip">Save {formatPrice(mainCombo.originalPrice - mainCombo.price)}</span>
                </div>
                <div className="deal-btns">
                  <Link to={`/products/${mainCombo.slug}`} className="deal-btn-primary">View Deal</Link>
                  <a href={waLink} target="_blank" rel="noreferrer" className="deal-btn-wa">
                    <FaWhatsapp style={{ marginRight: 6 }} />Order Now
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════
            TRUST STRIP
        ════════════════════════════════════════ */}
        <div className="niraa-section" style={{ marginTop: 48, marginBottom: 0 }}>
          <div className="trust-strip">
            {TRUSTS.map((t, i) => (
              <div className="trust-item" key={i}>
                <div className="trust-icon">{t.icon}</div>
                <div>
                  <div className="trust-label">{t.title}</div>
                  <div className="trust-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            STATS
        ════════════════════════════════════════ */}
        <div className="niraa-section" style={{ marginTop: 48 }}>
          <div className="stats-row">
            <StatCounter num={5000} suffix="+" label="Happy Customers" />
            <StatCounter num={38} suffix="%" label="Max Combo Savings" />
            <StatCounter num={99} suffix=".9%" label="Germ Kill Rate" />
          </div>
        </div>

        {/* ════════════════════════════════════════
            SHOP BY CATEGORY
        ════════════════════════════════════════ */}
        <div className="niraa-section">
          <SectionHeading
            label="Explore" title="Shop by Category"
            cta="View All" to="/products"
            onEdit={handleEdit} onDelete={handleDelete}
            isEditing={isEditing} editingItem={editingItem}
            item={{ _id: 'category-section', type: 'section' }}
          />
          <div className="cat-grid">
            {CATEGORIES.map(cat => {
              const count = individuals.filter(p => p.category === cat.id).length;
              return (
                <Link key={cat.id} to={`/products?category=${cat.id}`} className="cat-card">
                  <span className="cat-icon">{cat.icon}</span>
                  <div className="cat-name">{cat.label}</div>
                  <div className="cat-desc">{cat.desc}</div>
                  <div className="cat-count">{count} product{count !== 1 ? 's' : ''} →</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════════════
            LAUNDRY CARE
        ════════════════════════════════════════ */}
        <div className="niraa-section">
          <SectionHeading
            label="Laundry Care" title="👕 Detergents & Conditioners"
            cta="See All Laundry Care" to="/products?category=detergent"
            onEdit={handleEdit} onDelete={handleDelete}
            isEditing={isEditing} editingItem={editingItem}
            item={{ _id: 'laundry-care-section', type: 'section' }}
          />
          <div className="feature-banner" style={{ background: 'linear-gradient(135deg, #f5f3ff, #fff)', border: '1px solid rgba(124,58,237,0.1)' }}>
            <div className="feature-banner-icon" style={{ background: 'rgba(124,58,237,0.08)', fontSize: '1.6rem' }}>👗</div>
            <p className="feature-banner-text" style={{ color: 'var(--gray-600)', margin: 0 }}>
              <strong style={{ color: '#7c3aed' }}>Powerful deep clean</strong> for your clothes. 
              Removes tough stains while protecting colors and keeping fabrics soft.
            </p>
          </div>
          <div className="prod-grid">
            {individuals.filter(p => p.category === 'detergent').slice(0, 4).map(p => (
              <EnhancedProductCard key={p._id} product={p} compact onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            FLOOR CLEANERS
        ════════════════════════════════════════ */}
        <div className="niraa-section">
          <SectionHeading
            label="Floor Care" title="🧹 Floor Cleaners"
            cta="See All Floor Care" to="/products?category=floor-cleaner"
            onEdit={handleEdit} onDelete={handleDelete}
            isEditing={isEditing} editingItem={editingItem}
            item={{ _id: 'floor-care-section', type: 'section' }}
          />
          <div className="feature-banner" style={{ background: 'linear-gradient(135deg, #e8f7f5, #fefcf3)', border: '1px solid rgba(42,125,114,0.12)' }}>
            <div className="feature-banner-icon" style={{ background: 'rgba(42,125,114,0.1)', fontSize: '1.6rem' }}>🪵</div>
            <p className="feature-banner-text" style={{ color: 'var(--gray-600)', margin: 0 }}>
              <strong style={{ color: 'var(--teal-dark)' }}>Safe for all surfaces:</strong> marble, granite, tiles, and mosaic.
              No rinsing needed. Available in multiple fragrances with eco-refill options.
            </p>
          </div>
          <div className="prod-grid">
            {individuals.filter(p => p.category === 'floor-cleaner').slice(0, 4).map(p => (
              <EnhancedProductCard key={p._id} product={p} compact onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            TOILET CLEANERS
        ════════════════════════════════════════ */}
        <div className="niraa-section">
          <SectionHeading
            label="Bathroom Care" title="🚿 Toilet Cleaners"
            cta="See All Bathroom Care" to="/products?category=toilet-cleaner"
            onEdit={handleEdit} onDelete={handleDelete}
            isEditing={isEditing} editingItem={editingItem}
            item={{ _id: 'bathroom-care-section', type: 'section' }}
          />
          <div className="feature-banner" style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="feature-banner-icon" style={{ background: 'rgba(99,102,241,0.08)', fontSize: '1.6rem' }}>🧴</div>
            <p className="feature-banner-text" style={{ color: 'var(--gray-600)', margin: 0 }}>
              <strong style={{ color: '#4338ca' }}>Thick gel formula</strong> that clings under rims for deep cleaning.
              Kills 99.9% of germs and eliminates tough stains with a single application.
            </p>
          </div>
          <div className="prod-grid">
            {individuals.filter(p => p.category === 'toilet-cleaner').slice(0, 4).map(p => (
              <EnhancedProductCard key={p._id} product={p} compact onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            COMBO DEALS
        ════════════════════════════════════════ */}
        <div className="niraa-section">
          <div className="combo-header">
            <div className="combo-header-inner">
              <div>
                <div className="combo-eyebrow">🎁 Special Bundles</div>
                <h2 className="combo-title">Deals & Combo Offers</h2>
                <p className="combo-subtitle">Save up to 38% when you bundle your favourites together.</p>
              </div>
              <Link to="/products?category=combo" className="combo-cta">View All Combos →</Link>
            </div>
          </div>
          <div className="combo-grid">
            {combos.slice(0, 6).map(p => (
              <EnhancedProductCard key={p._id} product={p} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            TESTIMONIALS
        ════════════════════════════════════════ */}
        <div className="niraa-section">
          <SectionHeading
            label="What Customers Say" title="Loved by Families Across Dharmapuri"
            onEdit={handleEdit} onDelete={handleDelete}
            isEditing={isEditing} editingItem={editingItem}
            item={{ _id: 'testimonials-section', type: 'section' }}
          />
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div className="testimonial-card" key={i}>
                <div className="test-stars">
                  {Array(t.stars).fill(null).map((_, j) => <FaStar key={j} />)}
                </div>
                <p className="test-text">"{t.text}"</p>
                <div className="test-author">
                  <div className="test-avatar">{t.name[0]}</div>
                  <div>
                    <div className="test-name">{t.name}</div>
                    <div className="test-location">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            BOTTOM CTA
        ════════════════════════════════════════ */}
        <div className="niraa-section">
          <div className="bottom-cta">
            <h2 className="bottom-cta-title">Ready to order?<br />Get it in seconds.</h2>
            <p className="bottom-cta-sub">WhatsApp ordering for Dharmapuri &amp; nearby areas.<br />Pay via UPI or Cash on Delivery.</p>
            <div className="bottom-cta-btns">
              <a href={waLink} target="_blank" rel="noreferrer" className="btn-wa" style={{ fontSize: '1rem', padding: '15px 28px' }}>
                <FaWhatsapp /> Order via WhatsApp
              </a>
              <Link to="/products" style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                color: '#fff',
                padding: '15px 28px',
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'background 0.2s',
              }}>Browse All Products</Link>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}