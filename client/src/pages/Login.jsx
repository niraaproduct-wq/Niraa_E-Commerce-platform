import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';
import toast from 'react-hot-toast';

/* ─── Design tokens ──────────────────────────────────────────────── */
const T = {
  teal: '#1D9E75',
  tealDark: '#0F6E56',
  tealGlow: 'rgba(29,158,117,0.22)',
  tealGlowSm: 'rgba(29,158,117,0.12)',
  gold: '#c8a84b',
  ink: '#04100d',
  surface: 'rgba(8, 22, 18, 0.88)',
  surfaceAlt: 'rgba(14, 32, 26, 0.7)',
  border: 'rgba(29,158,117,0.18)',
  borderHover: 'rgba(29,158,117,0.45)',
  textPrimary: '#f0ece0',
  textSub: 'rgba(240,236,224,0.55)',
  textMuted: 'rgba(240,236,224,0.32)',
  fontDisplay: `'Fraunces', Georgia, serif`,
  fontBody: `'DM Sans', system-ui, sans-serif`,
};

/* ─── Global CSS ─────────────────────────────────────────────────── */
const CSS = `
  .lp * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Page shell ── */
  .lp-bg {
    min-height: 100vh;
    background: ${T.ink};
    display: flex;
    align-items: stretch;
    position: relative;
    overflow: hidden;
    font-family: ${T.fontBody};
  }

  /* ── Animated mesh gradient ── */
  .lp-mesh {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }
  .lp-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    animation: lp-breathe 8s ease-in-out infinite;
  }
  .lp-orb-1 {
    width: 600px; height: 600px;
    top: -200px; left: -150px;
    background: radial-gradient(circle, rgba(29,158,117,0.14) 0%, transparent 70%);
    animation-delay: 0s;
  }
  .lp-orb-2 {
    width: 500px; height: 500px;
    bottom: -180px; right: -100px;
    background: radial-gradient(circle, rgba(15,110,86,0.12) 0%, transparent 70%);
    animation-delay: -4s;
  }
  .lp-orb-3 {
    width: 300px; height: 300px;
    top: 40%; left: 40%;
    background: radial-gradient(circle, rgba(200,168,75,0.06) 0%, transparent 70%);
    animation-delay: -2s;
    animation-duration: 11s;
  }
  @keyframes lp-breathe {
    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.8; }
    33%       { transform: scale(1.1) translate(20px, -15px); opacity: 1; }
    66%       { transform: scale(0.95) translate(-15px, 10px); opacity: 0.7; }
  }

  /* ── Noise grain overlay ── */
  .lp-grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ── Left brand panel ── */
  .lp-brand {
    display: none;
    width: 420px;
    flex-shrink: 0;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 44px;
    position: relative;
    z-index: 2;
    border-right: 1px solid rgba(29,158,117,0.1);
  }
  @media (min-width: 900px) {
    .lp-brand { display: flex; }
  }

  .lp-brand-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .lp-brand-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${T.teal} 0%, ${T.tealDark} 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: ${T.fontDisplay};
    font-weight: 900;
    font-size: 18px;
    color: #fff;
    box-shadow: 0 4px 20px ${T.tealGlow};
  }
  .lp-brand-name {
    font-family: ${T.fontDisplay};
    font-weight: 900;
    font-size: 22px;
    color: ${T.textPrimary};
    letter-spacing: -.02em;
  }
  .lp-brand-sub {
    font-size: 10px;
    font-weight: 700;
    color: ${T.teal};
    letter-spacing: .1em;
    text-transform: uppercase;
    margin-left: 2px;
  }

  .lp-brand-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 0;
  }
  .lp-brand-tagline {
    font-family: ${T.fontDisplay};
    font-size: 2.6rem;
    font-weight: 900;
    line-height: 1.15;
    color: ${T.textPrimary};
    letter-spacing: -.03em;
    margin-bottom: 20px;
  }
  .lp-brand-tagline em {
    font-style: italic;
    color: ${T.teal};
  }
  .lp-brand-desc {
    font-size: 15px;
    color: ${T.textSub};
    line-height: 1.7;
    max-width: 280px;
  }

  .lp-brand-features {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 36px;
  }
  .lp-brand-feat {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: ${T.textSub};
    font-weight: 500;
  }
  .lp-brand-feat-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${T.teal};
    flex-shrink: 0;
    box-shadow: 0 0 8px ${T.tealGlow};
  }

  /* ── Right form panel ── */
  .lp-form-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    position: relative;
    z-index: 2;
  }

  /* ── Card ── */
  .lp-card {
    width: 100%;
    max-width: 460px;
    background: ${T.surface};
    backdrop-filter: blur(32px) saturate(160%);
    -webkit-backdrop-filter: blur(32px) saturate(160%);
    border: 1px solid ${T.border};
    border-radius: 28px;
    padding: 44px 40px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.03) inset,
      0 32px 80px rgba(0,0,0,0.6),
      0 0 60px rgba(29,158,117,0.06);
    animation: lp-card-in .65s cubic-bezier(.34,1.4,.64,1) both;
  }
  @keyframes lp-card-in {
    from { opacity: 0; transform: translateY(30px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @media (max-width: 520px) {
    .lp-card { padding: 32px 24px; border-radius: 22px; }
  }

  /* ── Mobile logo (shown only on narrow) ── */
  .lp-mobile-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    margin-bottom: 32px;
  }
  @media (min-width: 900px) { .lp-mobile-logo { display: none; } }

  /* ── Progress bar ── */
  .lp-progress-wrap {
    height: 3px;
    background: rgba(255,255,255,0.06);
    border-radius: 9999px;
    overflow: hidden;
    margin-bottom: 32px;
  }
  .lp-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, ${T.tealDark}, ${T.teal}, #4ade80);
    border-radius: 9999px;
    transition: width .5s cubic-bezier(.34,1.2,.64,1);
    box-shadow: 0 0 10px ${T.tealGlow};
  }
  .lp-progress-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .lp-step-text {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: ${T.teal};
  }
  .lp-step-count {
    font-size: 11px;
    color: ${T.textMuted};
    font-weight: 600;
  }

  /* ── Title block ── */
  .lp-title {
    margin-bottom: 32px;
  }
  .lp-h1 {
    font-family: ${T.fontDisplay};
    font-size: 2rem;
    font-weight: 900;
    color: ${T.textPrimary};
    letter-spacing: -.03em;
    line-height: 1.15;
    margin-bottom: 8px;
  }
  .lp-h1 em {
    font-style: italic;
    color: ${T.teal};
  }
  .lp-subtitle {
    font-size: 14px;
    color: ${T.textSub};
    line-height: 1.6;
  }

  /* ── Floating label field ── */
  .lp-field {
    position: relative;
    margin-bottom: 20px;
  }
  .lp-field-label {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: ${T.textSub};
    pointer-events: none;
    transition: all .2s cubic-bezier(.34,1.4,.64,1);
    background: transparent;
    padding: 0 4px;
    font-family: ${T.fontBody};
    font-weight: 500;
    z-index: 1;
  }
  .lp-field:focus-within .lp-field-label,
  .lp-field.has-val .lp-field-label {
    top: 0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: ${T.teal};
    background: ${T.ink};
    padding: 0 5px;
  }
  .lp-input {
    width: 100%;
    padding: 16px 16px 10px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    font-size: 15px;
    font-family: ${T.fontBody};
    color: ${T.textPrimary};
    outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
    caret-color: ${T.teal};
  }
  .lp-input::placeholder { color: transparent; }
  .lp-input:focus {
    border-color: ${T.teal};
    background: rgba(29,158,117,0.05);
    box-shadow: 0 0 0 3px ${T.tealGlowSm}, 0 4px 16px rgba(0,0,0,0.2);
  }
  .lp-input:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* prefix (phone +91) */
  .lp-phone-wrap { position: relative; }
  .lp-phone-prefix {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    font-weight: 700;
    color: ${T.teal};
    pointer-events: none;
    z-index: 2;
  }
  .lp-input.has-prefix { padding-left: 52px; }

  /* ── OTP digit boxes ── */
  .lp-otp-wrap {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 8px;
  }
  .lp-otp-box {
    width: 52px; height: 60px;
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    background: rgba(255,255,255,0.04);
    font-family: ${T.fontDisplay};
    font-size: 1.6rem;
    font-weight: 900;
    color: ${T.textPrimary};
    text-align: center;
    outline: none;
    transition: border-color .2s, box-shadow .2s, transform .15s cubic-bezier(.34,1.6,.64,1);
    caret-color: ${T.teal};
    -webkit-appearance: none;
    -moz-appearance: textfield;
  }
  .lp-otp-box::-webkit-outer-spin-button,
  .lp-otp-box::-webkit-inner-spin-button { -webkit-appearance: none; }
  .lp-otp-box:focus {
    border-color: ${T.teal};
    box-shadow: 0 0 0 3px ${T.tealGlowSm};
    background: rgba(29,158,117,0.07);
    transform: scale(1.06) translateY(-2px);
  }
  .lp-otp-box.filled {
    border-color: ${T.teal};
    background: rgba(29,158,117,0.1);
  }

  /* ── 2-col grid ── */
  .lp-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 0;
  }
  .lp-grid-2 .lp-field { margin-bottom: 0; }

  /* ── Info bar (shows selected phone/email) ── */
  .lp-info-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(29,158,117,0.07);
    border: 1px solid rgba(29,158,117,0.2);
    border-radius: 14px;
    padding: 13px 18px;
    margin-bottom: 22px;
  }
  .lp-info-bar-label { font-size: 11px; color: ${T.textMuted}; font-weight: 600; margin-bottom: 2px; }
  .lp-info-bar-val   { font-size: 14px; color: ${T.textPrimary}; font-weight: 700; }
  .lp-info-bar-change {
    font-size: 12px;
    color: ${T.teal};
    font-weight: 700;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 8px;
    transition: background .15s;
    font-family: ${T.fontBody};
  }
  .lp-info-bar-change:hover { background: rgba(29,158,117,0.15); }

  /* ── Address section ── */
  .lp-address-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }
  .lp-address-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${T.teal}, ${T.gold}, ${T.teal});
    background-size: 200%;
    animation: lp-address-shimmer 3s linear infinite;
  }
  @keyframes lp-address-shimmer {
    0%   { background-position: 0%; }
    100% { background-position: 200%; }
  }
  .lp-address-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }
  .lp-address-title {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: ${T.teal};
  }
  .lp-address-hint {
    font-size: 10px;
    color: ${T.textMuted};
    margin-top: 2px;
  }
  .lp-locate-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(29,158,117,0.1);
    border: 1px solid rgba(29,158,117,0.25);
    border-radius: 10px;
    color: ${T.teal};
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    font-family: ${T.fontBody};
    letter-spacing: .04em;
    text-transform: uppercase;
    transition: all .2s;
    white-space: nowrap;
  }
  .lp-locate-btn:hover:not(:disabled) {
    background: rgba(29,158,117,0.2);
    box-shadow: 0 4px 16px rgba(29,158,117,0.2);
    transform: translateY(-1px);
  }
  .lp-locate-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* ── Primary button ── */
  .lp-primary-btn {
    width: 100%;
    position: relative;
    overflow: hidden;
    padding: 16px;
    background: linear-gradient(135deg, ${T.teal} 0%, ${T.tealDark} 100%);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-weight: 800;
    font-size: 15px;
    cursor: pointer;
    font-family: ${T.fontBody};
    letter-spacing: .04em;
    box-shadow: 0 6px 24px ${T.tealGlow}, 0 0 0 1px rgba(255,255,255,0.05) inset;
    transition: all .2s cubic-bezier(.34,1.2,.64,1);
    margin-top: 4px;
  }
  .lp-primary-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 36px rgba(29,158,117,0.45);
  }
  .lp-primary-btn:active:not(:disabled) { transform: scale(.98); }
  .lp-primary-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

  /* shimmer overlay on primary btn */
  .lp-primary-btn::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 70%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    animation: lp-btn-shimmer 2.4s ease-in-out infinite;
  }
  @keyframes lp-btn-shimmer {
    0%   { left: -70%; }
    100% { left: 130%; }
  }
  .lp-primary-btn:disabled::after { display: none; }

  /* ripple */
  .lp-btn-ripple {
    position: absolute;
    border-radius: 50%;
    width: 8px; height: 8px;
    margin-left: -4px; margin-top: -4px;
    background: rgba(255,255,255,0.4);
    transform: scale(0);
    animation: lp-ripple .6s linear;
    pointer-events: none;
  }
  @keyframes lp-ripple { to { transform: scale(50); opacity: 0; } }

  /* ── Ghost button ── */
  .lp-ghost-btn {
    width: 100%;
    padding: 13px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    color: ${T.textSub};
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    font-family: ${T.fontBody};
    transition: all .2s;
    margin-top: 8px;
  }
  .lp-ghost-btn:hover {
    border-color: ${T.borderHover};
    color: ${T.teal};
    background: rgba(29,158,117,0.06);
  }

  /* ── Choice cards ── */
  .lp-choice-grid { display: flex; flex-direction: column; gap: 12px; }
  .lp-choice-card {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    cursor: pointer;
    transition: all .22s cubic-bezier(.34,1.2,.64,1);
    font-family: ${T.fontBody};
    text-align: left;
    color: ${T.textPrimary};
  }
  .lp-choice-card:hover {
    border-color: ${T.teal};
    background: rgba(29,158,117,0.07);
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(29,158,117,0.15);
  }
  .lp-choice-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    background: rgba(29,158,117,0.12);
    border: 1px solid rgba(29,158,117,0.2);
  }
  .lp-choice-title { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .lp-choice-sub   { font-size: 12px; color: ${T.textMuted}; }

  /* ── Method toggle ── */
  .lp-method-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 4px;
    gap: 4px;
    margin-bottom: 24px;
  }
  .lp-method-btn {
    padding: 10px;
    border-radius: 11px;
    border: none;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: ${T.fontBody};
    transition: all .25s cubic-bezier(.34,1.2,.64,1);
    background: transparent;
    color: ${T.textMuted};
  }
  .lp-method-btn.active {
    background: ${T.teal};
    color: #fff;
    box-shadow: 0 4px 14px ${T.tealGlow};
    transform: scale(1.02);
  }

  /* ── Resend row ── */
  .lp-resend-row {
    text-align: center;
    margin-top: 10px;
  }
  .lp-resend-btn {
    background: none;
    border: none;
    color: ${T.teal};
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: ${T.fontBody};
    padding: 4px 8px;
    border-radius: 8px;
    transition: background .15s;
  }
  .lp-resend-btn:hover { background: rgba(29,158,117,0.1); }
  .lp-resend-btn:disabled { opacity: .4; cursor: default; }

  /* ── Trust badges ── */
  .lp-trust {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  .lp-trust-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: ${T.textMuted};
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 20px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    transition: all .2s;
  }
  .lp-trust-badge:hover {
    color: ${T.textSub};
    border-color: rgba(29,158,117,0.2);
    background: rgba(29,158,117,0.05);
  }
  .lp-trust-dot { width: 5px; height: 5px; border-radius: 50%; background: ${T.teal}; }

  /* ── Footer ── */
  .lp-footer {
    margin-top: 20px;
    text-align: center;
    font-size: 11px;
    color: ${T.textMuted};
    line-height: 1.6;
  }
  .lp-footer a {
    color: ${T.teal};
    text-decoration: none;
    font-weight: 600;
    transition: opacity .15s;
  }
  .lp-footer a:hover { opacity: .75; }

  /* ── Step animations ── */
  .lp-step-enter { animation: lp-step-in .38s cubic-bezier(.34,1.3,.64,1) both; }
  @keyframes lp-step-in {
    from { opacity: 0; transform: translateX(22px) scale(0.97); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  .lp-step-back { animation: lp-step-back .38s cubic-bezier(.34,1.3,.64,1) both; }
  @keyframes lp-step-back {
    from { opacity: 0; transform: translateX(-22px) scale(0.97); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }

  /* ── Auth mode toggle link ── */
  .lp-mode-toggle {
    text-align: center;
    margin-top: 4px;
  }
  .lp-mode-toggle-btn {
    background: none;
    border: none;
    color: ${T.teal};
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: ${T.fontBody};
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: rgba(29,158,117,0.35);
    transition: text-decoration-color .2s;
  }
  .lp-mode-toggle-btn:hover { text-decoration-color: ${T.teal}; }

  /* Form gap helper */
  .lp-form-fields { display: flex; flex-direction: column; gap: 0; }
`;

/* ─── FloatField: floating label input ───────────────────────────── */
const FloatField = ({ label, type = 'text', value, onChange, placeholder, required, disabled, style, inputStyle, prefix, inputMode, maxLength, id }) => {
  const hasVal = value && value.length > 0;
  return (
    <div className={`lp-field${hasVal ? ' has-val' : ''}`} style={style}>
      {prefix && <span className="lp-phone-prefix">{prefix}</span>}
      <label className="lp-field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className={`lp-input${prefix ? ' has-prefix' : ''}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        required={required}
        disabled={disabled}
        style={inputStyle}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete="off"
      />
    </div>
  );
};

/* ─── RippleBtn ──────────────────────────────────────────────────── */
const RippleBtn = ({ onClick, disabled, loading, children, className = '', type = 'button', style }) => {
  const ref = useRef(null);
  const handleClick = (e) => {
    if (disabled || loading) return;
    const btn = ref.current;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'lp-btn-ripple';
    span.style.left = (e.clientX - rect.left) + 'px';
    span.style.top = (e.clientY - rect.top) + 'px';
    btn.appendChild(span);
    setTimeout(() => span.remove(), 600);
    onClick && onClick(e);
  };
  return (
    <button
      ref={ref}
      type={type}
      className={`lp-primary-btn ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      style={style}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'lp-spin .7s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.22-8.56" />
          </svg>
          {loading}
        </span>
      ) : children}
    </button>
  );
};

/* ─── OTP Input row ──────────────────────────────────────────────── */
const OtpInput = ({ value, onChange, length = 6 }) => {
  const refs = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleKey = (i, e) => {
    const isBackspace = e.key === 'Backspace';
    const isDigit = /^\d$/.test(e.key);
    if (!isDigit && !isBackspace) return e.preventDefault();

    let newVal = value.split('').concat(Array(length).fill('')).slice(0, length);

    if (isBackspace) {
      if (newVal[i]) {
        newVal[i] = '';
        onChange(newVal.join('').trimEnd());
      } else if (i > 0) {
        newVal[i - 1] = '';
        onChange(newVal.join('').trimEnd());
        refs.current[i - 1]?.focus();
      }
    } else {
      newVal[i] = e.key;
      onChange(newVal.join('').trimEnd());
      if (i < length - 1) refs.current[i + 1]?.focus();
    }
    e.preventDefault();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="lp-otp-wrap">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          className={`lp-otp-box${digits[i] ? ' filled' : ''}`}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onChange={() => { }}
          onClick={() => refs.current[i]?.select()}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
};

const sanitizeRedirectPath = (path) => {
  if (!path || typeof path !== 'string') return '/';
  const trimmed = path.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !/^[a-zA-Z]+:/.test(trimmed)) {
    return trimmed;
  }
  return '/';
};

/* ─── Main Component ─────────────────────────────────────────────── */
const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = sanitizeRedirectPath(location.state?.from || '/');

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(1);
  const [stepDir, setStepDir] = useState('forward'); // 'forward' | 'back'
  const [isExistingUser, setIsExistingUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState('otp');
  const [showChoice, setShowChoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [profile, setProfile] = useState({ firstName: '', lastName: '' });
  const [address, setAddress] = useState({ street: '', city: 'Dharmapuri', pincode: '' });

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const goStep = (n) => {
    setStepDir(n > step ? 'forward' : 'back');
    setStep(n);
  };

  /* ── Progress percentage ── */
  const progressPct = showChoice ? 45 : step === 1 ? 15 : step === 2 ? 50 : 90;

  /* ── Step label ── */
  const stepLabels = { 1: 'Phone', 2: 'Details', 3: 'Verify' };
  const stepLabel = showChoice ? 'Choose method' : stepLabels[step] || '';

  /* ── Handlers ── */
  const sendOtpToEmail = async (emailToUse) => {
    const res = await fetch(`${API_BASE_URL}/auth/send-email-otp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, email: emailToUse })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`${API_BASE_URL}/locations/reverse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
          });
          const data = await res.json();
          if (data?.address) {
            setAddress(prev => ({
              ...prev,
              street: data.address.street || '',
              city: data.address.city || 'Dharmapuri',
              pincode: data.address.zipCode || '',
            }));
            toast.success('📍 Location detected!');
          }
        } catch { toast.error('Service error. Enter manually.'); }
        finally { setLocating(false); }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) toast.error('Location permission denied.');
        else if (err.code === 3) toast.error('Location timed out. Enter manually.');
        else toast.error('Could not get location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handlePhoneSubmit = async e => {
    e.preventDefault();
    if (phone.length < 10) return toast.error('Enter a valid 10-digit number');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/check-phone`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to check phone number. Please try again.');
      
      setIsExistingUser(data.exists);
      if (data.exists) {
        setEmail(data.email || '');
        setMaskedEmail(data.maskedEmail || '');
        if (data.hasPassword) {
          setShowChoice(true);
        } else if (data.email) {
          const result = await sendOtpToEmail(data.email);
          goStep(3);
          setResendCooldown(30);
          toast.success(`OTP sent to ${data.maskedEmail}`);
          if (result.devOtp && import.meta.env.DEV) toast.success(`Dev OTP: ${result.devOtp}`, { duration: 5000 });
        } else {
          goStep(2); setMode('login');
        }
      } else {
        goStep(2); setMode('signup');
      }
    } catch (err) { toast.error(err.message || 'Failed to check phone number. Please check your connection.'); }
    finally { setLoading(false); }
  };

  const handlePasswordLogin = async e => {
    e.preventDefault();
    if (!loginPassword) return toast.error('Enter password');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data.user, data.token);
      toast.success('👋 Welcome back!');
      navigate(from, { replace: true });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleChoice = async (method) => {
    setLoginMethod(method);
    setShowChoice(false);
    if (method === 'otp') {
      setLoading(true);
      try {
        const result = await sendOtpToEmail(email);
        goStep(3);
        setResendCooldown(30);
        toast.success(`OTP sent to ${maskedEmail}`);
        if (result.devOtp && import.meta.env.DEV) toast.success(`Dev OTP: ${result.devOtp}`, { duration: 5000 });
      } catch (err) { toast.error(err.message); }
      finally { setLoading(false); }
    } else {
      goStep(1); // password mode, will show password form
    }
  };

  const handleDetailsSubmit = async e => {
    e.preventDefault();
    if (!email.includes('@')) return toast.error('Valid email required');
    if (mode === 'signup') {
      if (!profile.firstName.trim()) return toast.error('First name required');
      if (!signupPassword) return toast.error('Password required');
      if (signupPassword.length < 6) return toast.error('Password must be at least 6 characters');
      if (signupPassword !== signupConfirmPassword) return toast.error('Passwords do not match');
      if (!address.pincode) return toast.error('Pincode required');
    }
    setLoading(true);
    try {
      const result = await sendOtpToEmail(email);
      goStep(3);
      setResendCooldown(30);
      toast.success('OTP sent to your email!');
      if (result.devOtp && import.meta.env.DEV) toast.success(`Dev OTP: ${result.devOtp}`, { duration: 5000 });
    } catch (err) { toast.error(err.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async e => {
    e.preventDefault();
    if (otp.length < 4) return toast.error('Enter valid OTP');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone, otp, email,
          ...(mode === 'signup' ? { ...profile, address, password: signupPassword } : {}),
          ...(isExistingUser && !maskedEmail ? { ...profile, address } : {})
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      login(data.user, data.token);
      toast.success(data.isNewUser ? '🌿 Welcome to NIRAA!' : '👋 Welcome back!');
      navigate(from, { replace: true });
    } catch (err) { toast.error(err.message || 'Verification failed'); }
    finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await sendOtpToEmail(email);
      toast.success('New OTP sent!');
      setResendCooldown(30);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const animClass = stepDir === 'forward' ? 'lp-step-enter' : 'lp-step-back';

  /* ── Title derivation ── */
  const titles = {
    step1: mode === 'login' ? <>Welcome <em>back</em></> : <>Create <em>account</em></>,
    choice: <>How to <em>login?</em></>,
    password: <>Enter your <em>password</em></>,
    step2login: <>Link your <em>email</em></>,
    step2signup: <>Your <em>details</em></>,
    step3: <>Verify <em>OTP</em></>,
  };
  const getTitle = () => {
    if (step === 1 && showChoice) return titles.choice;
    if (step === 1 && !showChoice && loginMethod === 'password') return titles.password;
    if (step === 1) return titles.step1;
    if (step === 2) return mode === 'login' ? titles.step2login : titles.step2signup;
    return titles.step3;
  };
  const getSub = () => {
    if (step === 1 && showChoice) return `We found an account for +91 ${phone}`;
    if (step === 1 && !showChoice && loginMethod === 'password') return `Logging in as +91 ${phone}`;
    if (step === 1) return 'Enter your mobile number to continue';
    if (step === 2) return mode === 'login' ? 'We need your email for secure verification' : 'A few details to complete your profile';
    return `OTP sent to ${maskedEmail || email}`;
  };

  /* ───────────── RENDER ───────────── */
  return (
    <div className="lp">
      <style>{`
        ${CSS}
        @keyframes lp-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="lp-bg">
        {/* Mesh background */}
        <div className="lp-mesh" aria-hidden>
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-orb lp-orb-3" />
        </div>
        <div className="lp-grain" aria-hidden />

        {/* ── Brand panel (desktop) ── */}
        <aside className="lp-brand" aria-hidden>
          <Link to="/" className="lp-brand-logo">
            <div className="lp-brand-icon">N</div>
            <div>
              <div className="lp-brand-name">NIRAA</div>
              <div className="lp-brand-sub">Products</div>
            </div>
          </Link>

          <div className="lp-brand-body">
            <h2 className="lp-brand-tagline">
              Nature's finest,<br /><em>delivered</em><br />to your door.
            </h2>
            <p className="lp-brand-desc">
              Thoughtfully sourced, sustainably delivered. Join thousands discovering a better way to shop.
            </p>
            <div className="lp-brand-features">
              {['100% natural ingredients', 'Same-day delivery available', 'Eco-friendly packaging', 'Trusted by 10,000+ customers'].map(f => (
                <div className="lp-brand-feat" key={f}>
                  <div className="lp-brand-feat-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, color: T.textMuted }}>© 2025 NIRAA Products. All rights reserved.</div>
        </aside>

        {/* ── Form panel ── */}
        <main className="lp-form-panel">
          <div className="lp-card" role="main">

            {/* Mobile logo */}
            <Link to="/" className="lp-mobile-logo">
              <div className="lp-brand-icon" style={{ width: 36, height: 36, fontSize: 16, borderRadius: 10 }}>N</div>
              <div>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 18, color: T.textPrimary, letterSpacing: '-.02em' }}>NIRAA</div>
              </div>
            </Link>

            {/* Progress */}
            <div>
              <div className="lp-progress-label">
                <span className="lp-step-text">{stepLabel}</span>
                <span className="lp-step-count">Step {step} of 3</span>
              </div>
              <div className="lp-progress-wrap">
                <div className="lp-progress-bar" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Title */}
            <div className="lp-title" key={`title-${step}-${showChoice}-${loginMethod}`}>
              <h1 className="lp-h1">{getTitle()}</h1>
              <p className="lp-subtitle">{getSub()}</p>
            </div>

            {/* ── STEP 1 – Phone ── */}
            {step === 1 && !showChoice && loginMethod === 'otp' && (
              <form key="step1" onSubmit={handlePhoneSubmit} className={`lp-form-fields ${animClass}`}>
                <FloatField
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  prefix="+91"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  style={{ marginBottom: 24 }}
                />
                <RippleBtn
                  type="submit"
                  disabled={phone.length < 10}
                  loading={loading ? 'Checking…' : null}
                >
                  Continue →
                </RippleBtn>
                <div className="lp-mode-toggle" style={{ marginTop: 16 }}>
                  <button type="button" className="lp-mode-toggle-btn"
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setPhone(''); }}>
                    {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 1 – Choice ── */}
            {step === 1 && showChoice && (
              <div key="choice" className={`lp-choice-grid ${animClass}`}>
                <button className="lp-choice-card" onClick={() => handleChoice('password')}>
                  <div className="lp-choice-icon">🔑</div>
                  <div>
                    <div className="lp-choice-title">Login with Password</div>
                    <div className="lp-choice-sub">Use your saved password</div>
                  </div>
                </button>
                <button className="lp-choice-card" onClick={() => handleChoice('otp')}>
                  <div className="lp-choice-icon">✉️</div>
                  <div>
                    <div className="lp-choice-title">Get OTP on Email</div>
                    <div className="lp-choice-sub">{maskedEmail}</div>
                  </div>
                </button>
                <button className="lp-ghost-btn" onClick={() => setShowChoice(false)}>← Use different number</button>
              </div>
            )}

            {/* ── STEP 1 – Password ── */}
            {step === 1 && !showChoice && loginMethod === 'password' && (
              <form key="password" onSubmit={handlePasswordLogin} className={`lp-form-fields ${animClass}`}>
                <div className="lp-info-bar">
                  <div>
                    <div className="lp-info-bar-label">Logging in as</div>
                    <div className="lp-info-bar-val">+91 {phone}</div>
                  </div>
                  <button type="button" className="lp-info-bar-change"
                    onClick={() => { setLoginMethod('otp'); setPhone(''); }}>Change</button>
                </div>
                <FloatField id="pwd" label="Password" type="password" value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)} required
                  style={{ marginBottom: 24 }} />
                <RippleBtn type="submit" loading={loading ? 'Logging in…' : null}>Login →</RippleBtn>
                <button type="button" className="lp-ghost-btn"
                  onClick={() => { setLoginMethod('otp'); setShowChoice(true); }}>← Other login methods</button>
              </form>
            )}

            {/* ── STEP 2 – Details / Email ── */}
            {step === 2 && (
              <form key="step2" onSubmit={handleDetailsSubmit} className={`lp-form-fields ${animClass}`}>
                {mode === 'signup' && (
                  <div className="lp-grid-2" style={{ marginBottom: 20 }}>
                    <FloatField id="fn" label="First Name" value={profile.firstName}
                      onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} required />
                    <FloatField id="ln" label="Last Name" value={profile.lastName}
                      onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                )}

                <FloatField id="email" label="Email Address" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  style={{ marginBottom: mode === 'signup' ? 20 : 24 }} />

                {mode === 'signup' && (
                  <>
                    <div className="lp-grid-2" style={{ marginBottom: 20 }}>
                      <FloatField id="sp" label="Create Password" type="password" value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)} required />
                      <FloatField id="sc" label="Confirm Password" type="password" value={signupConfirmPassword}
                        onChange={e => setSignupConfirmPassword(e.target.value)} required />
                    </div>

                    <div className="lp-address-box">
                      <div className="lp-address-header">
                        <div>
                          <div className="lp-address-title">📍 Delivery Address</div>
                          <div className="lp-address-hint">Accuracy may vary on desktops</div>
                        </div>
                        <button type="button" className="lp-locate-btn" onClick={handleGetLocation} disabled={locating}>
                          {locating
                            ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'lp-spin .7s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg> Locating…</>
                            : '📍 Auto-detect'}
                        </button>
                      </div>
                      <FloatField id="street" label="Street / Landmark" value={address.street}
                        onChange={e => setAddress(p => ({ ...p, street: e.target.value }))}
                        style={{ marginBottom: 14 }} />
                      <div className="lp-grid-2">
                        <FloatField id="city" label="City" value={address.city}
                          onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} />
                        <FloatField id="pin" label="Pincode" value={address.pincode}
                          onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))}
                          inputMode="numeric" maxLength={6} required />
                      </div>
                    </div>
                  </>
                )}

                <RippleBtn type="submit" loading={loading ? 'Sending OTP…' : null} style={{ marginTop: 4 }}>
                  Send OTP →
                </RippleBtn>
                <button type="button" className="lp-ghost-btn" onClick={() => goStep(1)}>← Back</button>
              </form>
            )}

            {/* ── STEP 3 – OTP ── */}
            {step === 3 && (
              <form key="step3" onSubmit={handleVerifyOtp} className={`lp-form-fields ${animClass}`}>
                <div className="lp-info-bar">
                  <div>
                    <div className="lp-info-bar-label">OTP sent to</div>
                    <div className="lp-info-bar-val">{maskedEmail || email}</div>
                  </div>
                  <button type="button" className="lp-info-bar-change" onClick={() => goStep(2)}>Change</button>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <OtpInput value={otp} onChange={setOtp} length={6} />
                  <div className="lp-resend-row">
                    <button type="button" className="lp-resend-btn"
                      onClick={handleResendOtp} disabled={resendCooldown > 0 || loading}>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>

                <RippleBtn type="submit" disabled={otp.length < 4} loading={loading ? 'Verifying…' : null}>
                  ✓ Verify & Login
                </RippleBtn>
              </form>
            )}

            {/* ── Trust badges ── */}
            <div className="lp-trust" aria-label="Trust indicators">
              {[['🔒', 'Secure login'], ['🌿', 'Eco brand'], ['⚡', 'Fast checkout']].map(([icon, label]) => (
                <div key={label} className="lp-trust-badge">
                  <div className="lp-trust-dot" aria-hidden />
                  {icon} {label}
                </div>
              ))}
            </div>

            {/* ── Footer ── */}
            <div className="lp-footer">
              By continuing, you agree to our{' '}
              <a href="/terms">Terms</a> &amp; <a href="/privacy">Privacy Policy</a>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;