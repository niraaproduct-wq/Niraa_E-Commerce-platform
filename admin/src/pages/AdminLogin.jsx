import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../utils/constants.js';

/* ─── Keyframe injection ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --ink:       #0a0a0f;
    --surface:   #0f0f1a;
    --card:      #14141f;
    --teal:      #00c9a7;
    --teal-dim:  #00856e;
    --gold:      #f5c842;
    --muted:     #4a4a6a;
    --border:    rgba(255,255,255,0.07);
    --glow:      0 0 40px rgba(0,201,167,0.25);
  }

  .al-root * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── page ── */
  .al-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  /* ── animated mesh background ── */
  .al-bg {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 80%, rgba(0,201,167,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 10%, rgba(245,200,66,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 70% 80% at 50% 50%, rgba(15,15,26,1) 0%, transparent 100%);
  }

  /* ── floating grid lines ── */
  .al-grid {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    animation: gridDrift 20s linear infinite;
  }
  @keyframes gridDrift { from { background-position: 0 0; } to { background-position: 48px 48px; } }

  /* ── floating orbs ── */
  .al-orb {
    position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
    filter: blur(70px);
    animation: orbFloat 8s ease-in-out infinite alternate;
  }
  .al-orb-1 { width: 340px; height: 340px; background: rgba(0,201,167,0.13); top: -80px; right: -60px; animation-delay: 0s; }
  .al-orb-2 { width: 260px; height: 260px; background: rgba(245,200,66,0.08); bottom: -60px; left: -40px; animation-delay: -3s; }
  .al-orb-3 { width: 180px; height: 180px; background: rgba(0,201,167,0.07); top: 55%; left: 60%; animation-delay: -6s; }
  @keyframes orbFloat {
    from { transform: translateY(0) scale(1); }
    to   { transform: translateY(-30px) scale(1.08); }
  }

  /* ── card ── */
  .al-card {
    position: relative; z-index: 1;
    width: min(420px, 92vw);
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 48px 44px 44px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.5), var(--glow);
    animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
    backdrop-filter: blur(12px);
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(40px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  /* ── card shine sweep ── */
  .al-card::before {
    content: '';
    position: absolute; inset: 0; border-radius: 24px; pointer-events: none;
    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
  }

  /* ── logo / badge ── */
  .al-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(0,201,167,0.1);
    border: 1px solid rgba(0,201,167,0.25);
    border-radius: 100px;
    padding: 5px 14px 5px 6px;
    margin-bottom: 28px;
    animation: cardIn 0.7s 0.1s cubic-bezier(0.22,1,0.36,1) both;
  }
  .al-badge-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--teal);
    box-shadow: 0 0 8px var(--teal);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { transform: scale(1); opacity:1; }
    50%      { transform: scale(1.4); opacity:0.7; }
  }
  .al-badge-label { font-size: 11px; letter-spacing: 0.08em; color: var(--teal); font-weight: 500; text-transform: uppercase; }

  /* ── headings ── */
  .al-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    color: #fff; line-height: 1.15;
    margin-bottom: 6px;
    animation: cardIn 0.7s 0.15s cubic-bezier(0.22,1,0.36,1) both;
  }
  .al-subtitle {
    font-size: 13.5px; color: var(--muted); font-weight: 400;
    margin-bottom: 36px; line-height: 1.5;
    animation: cardIn 0.7s 0.2s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* ── field group ── */
  .al-field {
    position: relative; margin-bottom: 16px;
    animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
  }
  .al-field:nth-child(1) { animation-delay: 0.25s; }
  .al-field:nth-child(2) { animation-delay: 0.32s; }

  .al-label {
    display: block; font-size: 11.5px; font-weight: 500;
    color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 8px;
    transition: color 0.25s;
  }
  .al-field:focus-within .al-label { color: var(--teal); }

  .al-input-wrap {
    position: relative;
    display: flex; align-items: center;
  }
  .al-icon {
    position: absolute; left: 15px;
    color: var(--muted);
    transition: color 0.25s;
    pointer-events: none;
    display: flex; align-items: center;
  }
  .al-field:focus-within .al-icon { color: var(--teal); }

  .al-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 13px 14px 13px 44px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    outline: none;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  }
  .al-input::placeholder { color: rgba(255,255,255,0.2); }
  .al-input:focus {
    border-color: var(--teal);
    background: rgba(0,201,167,0.05);
    box-shadow: 0 0 0 3px rgba(0,201,167,0.12);
  }
  .al-input.error {
    border-color: #ff5c7d;
    box-shadow: 0 0 0 3px rgba(255,92,125,0.12);
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
  }
  @keyframes shake {
    10%,90%  { transform: translateX(-2px); }
    20%,80%  { transform: translateX(4px); }
    30%,50%,70% { transform: translateX(-4px); }
    40%,60%  { transform: translateX(4px); }
  }

  /* eye toggle */
  .al-eye {
    position: absolute; right: 14px;
    background: none; border: none; cursor: pointer;
    color: var(--muted); padding: 4px;
    display: flex; align-items: center;
    transition: color 0.2s;
  }
  .al-eye:hover { color: #fff; }

  /* ── error message ── */
  .al-error {
    font-size: 12px; color: #ff5c7d; margin-top: 6px;
    display: flex; align-items: center; gap: 5px;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }

  /* ── submit button ── */
  .al-btn {
    position: relative; width: 100%; overflow: hidden;
    margin-top: 28px;
    background: var(--teal);
    border: none; border-radius: 12px;
    color: #0a0a0f;
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    letter-spacing: 0.03em;
    padding: 14px;
    cursor: pointer;
    transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
    animation: cardIn 0.7s 0.38s cubic-bezier(0.22,1,0.36,1) both;
  }
  .al-btn::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
    transition: left 0.45s ease;
  }
  .al-btn:hover:not(:disabled)::after { left: 150%; }
  .al-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0,201,167,0.45);
  }
  .al-btn:active:not(:disabled) { transform: translateY(0); }
  .al-btn:disabled { background: var(--teal-dim); cursor: not-allowed; opacity: 0.7; }

  /* spinner inside button */
  .al-spinner {
    display: inline-block;
    width: 16px; height: 16px;
    border: 2px solid rgba(10,10,15,0.4);
    border-top-color: #0a0a0f;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── divider ── */
  .al-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0 0;
    animation: cardIn 0.7s 0.42s cubic-bezier(0.22,1,0.36,1) both;
  }
  .al-divider span { flex:1; height:1px; background: var(--border); }
  .al-divider p { font-size: 11px; color: var(--muted); white-space: nowrap; }

  /* ── footer note ── */
  .al-footer {
    margin-top: 24px; text-align: center;
    font-size: 11.5px; color: var(--muted);
    animation: cardIn 0.7s 0.46s cubic-bezier(0.22,1,0.36,1) both;
  }
  .al-footer a { color: var(--teal); text-decoration: none; }
  .al-footer a:hover { text-decoration: underline; }

  /* ── success overlay ── */
  .al-success-overlay {
    position: absolute; inset: 0; border-radius: 24px; z-index: 10;
    background: rgba(14,14,25,0.97);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
    animation: fadeIn 0.35s ease;
  }
  .al-check {
    width: 60px; height: 60px;
    border-radius: 50%;
    background: rgba(0,201,167,0.12);
    border: 2px solid var(--teal);
    display: flex; align-items: center; justify-content: center;
    animation: scaleIn 0.4s cubic-bezier(0.22,1,0.36,1);
    box-shadow: 0 0 30px rgba(0,201,167,0.3);
  }
  @keyframes scaleIn { from { transform: scale(0); opacity:0; } to { transform: scale(1); opacity:1; } }
  .al-success-text {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #fff;
    animation: cardIn 0.5s 0.2s both;
  }
  .al-success-sub {
    font-size: 13px; color: var(--muted);
    animation: cardIn 0.5s 0.3s both;
  }
`;

/* ─── SVG Icons ─── */
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconEye = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconCheck = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00c9a7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconAlert = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ─── Component ─── */
export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [shake, setShake]       = useState({});
  const { login } = useAuth();
  const styleRef = useRef(null);

  // Inject styles once
  useEffect(() => {
    if (!document.getElementById('al-styles')) {
      const tag = document.createElement('style');
      tag.id = 'al-styles';
      tag.textContent = STYLES;
      document.head.appendChild(tag);
    }
  }, []);

  const validate = () => {
    const e = {};
    if (!email)    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const triggerShake = (field) => {
    setShake(p => ({ ...p, [field]: true }));
    setTimeout(() => setShake(p => ({ ...p, [field]: false })), 450);
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      Object.keys(errs).forEach(triggerShake);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ global: data.message || 'Login failed. Please try again.' });
        triggerShake('email'); triggerShake('password');
        return;
      }
      login(data.user);
      localStorage.setItem('niraa_admin_auth', 'true');
      setSuccess(true);
      setTimeout(() => window.location.assign('/dashboard'), 1200);
    } catch {
      setErrors({ global: 'Network error — please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div className="al-root">
      {/* Background layers */}
      <div className="al-bg" />
      <div className="al-grid" />
      <div className="al-orb al-orb-1" />
      <div className="al-orb al-orb-2" />
      <div className="al-orb al-orb-3" />

      <div className="al-card">
        {/* Success overlay */}
        {success && (
          <div className="al-success-overlay">
            <div className="al-check"><IconCheck /></div>
            <p className="al-success-text">Authenticated!</p>
            <p className="al-success-sub">Redirecting to dashboard…</p>
          </div>
        )}

        {/* Badge */}
        <div className="al-badge">
          <span className="al-badge-dot" />
          <span className="al-badge-label">Secure Admin Portal</span>
        </div>

        <h1 className="al-title">Welcome back</h1>
        <p className="al-subtitle">Sign in to access your admin dashboard.</p>

        {/* Global error */}
        {errors.global && (
          <div className="al-error" style={{ marginBottom: 16, fontSize: 13 }}>
            <IconAlert /> {errors.global}
          </div>
        )}

        {/* Email */}
        <div className="al-field">
          <label className="al-label" htmlFor="al-email">Email address</label>
          <div className="al-input-wrap">
            <span className="al-icon"><IconMail /></span>
            <input
              id="al-email"
              className={`al-input${shake.email ? ' error' : ''}`}
              type="email"
              placeholder="admin@example.com"
              value={email}
              autoComplete="email"
              onKeyDown={handleKey}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
            />
          </div>
          {errors.email && <p className="al-error"><IconAlert />{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="al-field">
          <label className="al-label" htmlFor="al-pw">Password</label>
          <div className="al-input-wrap">
            <span className="al-icon"><IconLock /></span>
            <input
              id="al-pw"
              className={`al-input${shake.password ? ' error' : ''}`}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••••"
              value={password}
              autoComplete="current-password"
              onKeyDown={handleKey}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
            />
            <button className="al-eye" type="button" aria-label="Toggle password" onClick={() => setShowPw(v => !v)}>
              <IconEye open={showPw} />
            </button>
          </div>
          {errors.password && <p className="al-error"><IconAlert />{errors.password}</p>}
        </div>

        {/* Submit */}
        <button className="al-btn" disabled={loading} onClick={submit} type="button">
          {loading ? <><span className="al-spinner" />Verifying…</> : 'Sign in to Dashboard →'}
        </button>

        <div className="al-divider">
          <span /><p>protected by end-to-end encryption</p><span />
        </div>

        <p className="al-footer">
          Having trouble? <a href="mailto:support@niraa.com">Contact support</a>
        </p>
      </div>
    </div>
  );
}