import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../utils/constants';
import AdminBuilder from './AdminBuilder';
import AdminCustomers from './AdminCustomers';
import AdminProducts from './AdminProducts';
import AdminOrdersPage from './AdminOrders';
import AdminMarketing from './Adminmarketing';


// ─── Google Fonts ─────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Geist:wght@300;400;500;600;700&display=swap');`;

// ─── Global styles ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --sans: 'Geist', system-ui, sans-serif;
    --display: 'Syne', system-ui, sans-serif;
    --mono: 'JetBrains Mono', monospace;
    --bg: #070b10;
    --surface: #0d1219;
    --surface-2: #111820;
    --surface-3: #181f2a;
    --border: rgba(255,255,255,0.06);
    --border-active: rgba(255,255,255,0.13);
    --accent: #2EB89A;
    --accent-dim: rgba(46,184,154,0.15);
    --accent-glow: rgba(46,184,154,0.3);
    --text-primary: #f0f4f8;
    --text-secondary: rgba(240,244,248,0.5);
    --text-muted: rgba(240,244,248,0.28);
    --red: #F87171;
    --red-dim: rgba(248,113,113,0.12);
    --amber: #FBBF24;
    --amber-dim: rgba(251,191,36,0.12);
    --blue: #60A5FA;
    --blue-dim: rgba(96,165,250,0.12);
    --green: #4ADE80;
    --green-dim: rgba(74,222,128,0.12);
    --purple: #A78BFA;
    --purple-dim: rgba(167,139,250,0.12);
    --sidebar-w: 228px;
    --sidebar-collapsed-w: 60px;
    --topbar-h: 58px;
    --radius: 10px;
    --radius-lg: 14px;
    --radius-xl: 18px;
    --shadow: 0 1px 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25);
    --shadow-lg: 0 2px 4px rgba(0,0,0,0.5), 0 12px 40px rgba(0,0,0,0.4);
  }
  body { font-family: var(--sans); background: #0d1219; color: var(--text-primary); }
  ::selection { background: var(--accent-dim); color: var(--accent); }
  scrollbar-width: thin;
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-active); border-radius: 99px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1); opacity: 0.4; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  .animate-in { animation: fadeUp 0.3s ease both; }
  .skeleton {
    background: linear-gradient(90deg, var(--surface-3) 25%, var(--surface-2) 50%, var(--surface-3) 75%);
    background-size: 800px 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius);
  }

  .nav-link {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 10px; border-radius: var(--radius);
    color: var(--text-secondary); font-size: 13px; font-weight: 500;
    text-decoration: none; transition: all 0.15s ease;
    position: relative; cursor: pointer; user-select: none;
    font-family: var(--sans);
  }
  .nav-link:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
  .nav-link.active {
    background: linear-gradient(135deg, rgba(46,184,154,0.18), rgba(46,184,154,0.08));
    color: #fff; font-weight: 600;
    box-shadow: inset 0 0 0 1px rgba(46,184,154,0.2);
  }
  .nav-link.active::before {
    content: ''; position: absolute; left: -1px; top: 50%; transform: translateY(-50%);
    width: 2.5px; height: 16px; background: var(--accent);
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px var(--accent-glow);
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px 22px;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute;
    inset: 0; border-radius: inherit;
    background: radial-gradient(ellipse at top right, var(--accent-color, transparent) 0%, transparent 65%);
    opacity: 0; transition: opacity 0.3s;
    pointer-events: none;
  }
  .stat-card:hover { border-color: var(--border-active); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .stat-card:hover::before { opacity: 1; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 18px; border-radius: var(--radius); font-family: var(--sans);
    font-size: 13px; font-weight: 600; cursor: pointer; border: none;
    transition: all 0.15s ease; text-decoration: none;
  }
  .btn-primary {
    background: var(--accent); color: #021a14;
    box-shadow: 0 2px 12px var(--accent-glow);
  }
  .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 20px var(--accent-glow); }
  .btn-ghost { background: var(--surface-3); color: var(--text-primary); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--border-active); background: rgba(255,255,255,0.07); }
  .btn-danger { background: var(--red-dim); color: var(--red); border: 1px solid rgba(248,113,113,0.2); }
  .btn-whatsapp { background: #25D366; color: #fff; box-shadow: 0 2px 12px rgba(37,211,102,0.3); }
  .btn-whatsapp:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

  .input {
    width: 100%; padding: 10px 14px;
    background: var(--surface-3); border: 1px solid var(--border);
    border-radius: var(--radius); font-family: var(--sans); font-size: 13.5px;
    color: var(--text-primary); outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .input::placeholder { color: var(--text-muted); }
  textarea.input { resize: vertical; min-height: 100px; line-height: 1.6; }

  .table-row { transition: background 0.1s; }
  .table-row:hover { background: rgba(255,255,255,0.03); }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10.5px; font-weight: 700; padding: 3px 9px;
    border-radius: 99px; letter-spacing: 0.03em; white-space: nowrap;
  }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-xl); overflow: hidden;
    box-shadow: var(--shadow);
  }
  .card-header {
    padding: 18px 22px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    background: var(--surface-2);
  }
  .card-title { font-family: var(--display); font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .card-subtitle { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; font-family: var(--sans); }

  .section-label {
    font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--text-muted);
    padding: 10px 10px 4px; font-family: var(--display);
  }

  .live-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--green);
    position: relative;
  }
  .live-dot::after {
    content: ''; position: absolute;
    inset: -2px; border-radius: 50%; background: var(--green);
    animation: pulse-ring 1.4s ease-out infinite;
  }
`;

// ─── Light theme token overrides ─────────────────────────────────────────────
const LIGHT_TOKENS = `
  :root {
    --bg: #f0f4f8;
    --surface: #ffffff;
    --surface-2: #f8fafc;
    --surface-3: #f1f5f9;
    --border: rgba(0,0,0,0.08);
    --border-active: rgba(0,0,0,0.16);
    --accent: #0f9c7a;
    --accent-dim: rgba(15,156,122,0.12);
    --accent-glow: rgba(15,156,122,0.25);
    --text-primary: #0f172a;
    --text-secondary: rgba(15,23,42,0.55);
    --text-muted: rgba(15,23,42,0.35);
    --red: #dc2626;
    --red-dim: rgba(220,38,38,0.10);
    --amber: #d97706;
    --amber-dim: rgba(217,119,6,0.10);
    --blue: #2563eb;
    --blue-dim: rgba(37,99,235,0.10);
    --green: #16a34a;
    --green-dim: rgba(22,163,74,0.10);
    --purple: #7c3aed;
    --purple-dim: rgba(124,58,237,0.10);
    --shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05);
    --shadow-lg: 0 2px 8px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.08);
  }
  body { background: #f0f4f8; }
  .nav-link:hover { background: rgba(0,0,0,0.05); }
  .nav-link.active {
    background: linear-gradient(135deg, rgba(15,156,122,0.15), rgba(15,156,122,0.06));
    color: #0a5c45;
    box-shadow: inset 0 0 0 1px rgba(15,156,122,0.2);
  }
  .btn-ghost { background: var(--surface-3); border-color: var(--border); }
  .btn-ghost:hover { background: #e2e8f0; border-color: var(--border-active); }
  .table-row:hover { background: rgba(0,0,0,0.02); }
`;

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const Ic = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const P = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  box: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  megaphone: 'M3 11l19-9-9 19-2-8-8-2z',
  layout: 'M12 3H3v7h9V3zM21 3h-6v4h6V3zM21 10h-6v11h6V10zM12 13H3v8h9v-8z',
  arrow: 'M19 12H5M12 19l-7-7 7-7',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  bell: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  trend: 'M23 6l-9.5 9.5-5-5L1 18',
  check: 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  chevronR: 'M9 18l6-6-6-6',
  spark: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  store: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  chevronL: 'M15 18l-6-6 6-6',
  ellipsis: 'M12 5v.01M12 12v.01M12 19v.01',
  plus: 'M12 5v14M5 12h14',
};

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  delivered: { color: 'var(--green)', bg: 'var(--green-dim)', dot: true },
  placed: { color: 'var(--blue)', bg: 'var(--blue-dim)', dot: true },
  confirmed: { color: 'var(--amber)', bg: 'var(--amber-dim)', dot: true },
  'out-for-delivery': { color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', dot: true },
  cancelled: { color: 'var(--red)', bg: 'var(--red-dim)', dot: false },
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to) =>
    to === '/dashboard'
      ? location.pathname === to
      : location.pathname.startsWith(to);

  const handleLogout = () => {
    localStorage.removeItem('niraa_token');
    localStorage.removeItem('niraa_user');
    localStorage.removeItem('niraa_admin_auth');
    navigate('/login');
  };

  const NAV = [
    { to: '/dashboard', icon: P.grid, label: 'Dashboard' },
    { to: '/orders', icon: P.box, label: 'Orders' },
    { to: '/products', icon: P.tag, label: 'Products' },
    { to: '/customers', icon: P.users, label: 'Customers' },
  ];
  const STORE_NAV = [
    { to: '/marketing', icon: P.megaphone, label: 'Marketing' },
    { to: '/builder', icon: P.layout, label: 'Site Builder' },
  ];

  return (
    <aside style={{
      width: collapsed ? 'var(--sidebar-collapsed-w)' : 'var(--sidebar-w)',
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden',
      borderRight: '1px solid var(--border)',
      position: 'relative',
    }}>
      {/* Subtle gradient shimmer at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 180,
        background: 'radial-gradient(ellipse at top left, rgba(46,184,154,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 14px',
        borderBottom: '1px solid var(--border)',
        marginBottom: 6,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent) 0%, #1a8a72 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            margin: collapsed ? '0 auto' : 0,
            boxShadow: '0 2px 10px var(--accent-glow)',
          }}>
            <span style={{ color: '#021a14', fontWeight: 900, fontSize: 15, fontFamily: 'var(--display)' }}>N</span>
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--display)', color: 'var(--text-primary)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1 }}>NIRAA</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Admin Console</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '6px 6px' : '6px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {collapsed ? (
          [...NAV, ...STORE_NAV].map(item => (
            <Link key={item.to} to={item.to} title={item.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '10px 0', borderRadius: 'var(--radius)',
              color: isActive(item.to) ? 'var(--accent)' : 'var(--text-secondary)',
              textDecoration: 'none',
              background: isActive(item.to) ? 'var(--accent-dim)' : 'transparent',
              transition: 'all 0.15s',
              margin: '1px 0',
            }}>
              <Ic d={item.icon} size={17} />
            </Link>
          ))
        ) : (
          <>
            <div className="section-label">Main</div>
            {NAV.map(item => (
              <Link key={item.to} to={item.to} className={`nav-link${isActive(item.to) ? ' active' : ''}`}>
                <Ic d={item.icon} size={15} />
                {item.label}
              </Link>
            ))}
            <div className="section-label" style={{ marginTop: 8 }}>Store</div>
            {STORE_NAV.map(item => (
              <Link key={item.to} to={item.to} className={`nav-link${isActive(item.to) ? ' active' : ''}`}>
                <Ic d={item.icon} size={15} />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: collapsed ? '10px 6px' : '10px 10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        {!collapsed && (
          <a href="https://niraa-customer.vercel.app" target="_blank" rel="noreferrer"
            className="nav-link"
            style={{ marginBottom: 2, display: 'flex' }}>
            <Ic d={P.eye} size={15} />
            View Store
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>↗</span>
          </a>
        )}
        <div className="nav-link" onClick={handleLogout} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <Ic d={P.logout} size={15} />
          {!collapsed && 'Sign Out'}
        </div>
        <button onClick={() => setCollapsed(c => !c)} style={{
          marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', gap: 6, padding: '7px', borderRadius: 'var(--radius)',
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11,
          fontFamily: 'var(--sans)', transition: 'background 0.15s, border-color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
          <span style={{ display: 'inline-block', transition: 'transform 0.22s', transform: collapsed ? 'rotate(180deg)' : 'none' }}>
            <Ic d={P.chevronL} size={13} />
          </span>
          {!collapsed && <span style={{ fontSize: 11, letterSpacing: '0.04em' }}>COLLAPSE</span>}
        </button>
      </div>
    </aside>
  );
};

// ─── Top Bar ──────────────────────────────────────────────────────────────────
const TopBar = ({ title, subtitle, theme, toggleTheme }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const user = (() => { try { return JSON.parse(localStorage.getItem('niraa_user') || 'null'); } catch { return null; } })();
  const initials = (user?.name || 'Admin').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{
      height: 'var(--topbar-h)',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 22px', gap: 16, flexShrink: 0,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.01em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--sans)' }}>{subtitle}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--green-dim)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 99, fontSize: 11, fontWeight: 600, color: 'var(--green)', fontFamily: 'var(--sans)' }}>
          <div className="live-dot" />
          LIVE
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: 34, height: 34, borderRadius: 'var(--radius)',
            background: 'var(--surface-3)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16, transition: 'all 0.15s',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-3)'; }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Clock */}
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.04em', background: 'var(--surface-3)', padding: '5px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>

        {/* User chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 12px 6px 6px', cursor: 'default' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #1a8a72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#021a14', fontWeight: 700, fontSize: 11,
            fontFamily: 'var(--display)', letterSpacing: '0.04em',
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Administrator</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Layout ───────────────────────────────────────────────────────────────────
const PAGE_META = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Store overview & recent activity' },
  '/orders': { title: 'Orders', subtitle: 'Manage and track all orders' },
  '/products': { title: 'Products', subtitle: 'Manage your product catalogue' },
  '/customers': { title: 'Customers', subtitle: 'Customer profiles and activity' },
  '/marketing': { title: 'Marketing', subtitle: 'Campaigns and promotions' },
  '/builder': { title: 'Site Builder', subtitle: 'Customize your storefront layout' },
  '/inventory': { title: 'Inventory', subtitle: 'Stock levels and alerts' },
};

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('niraa_theme') || 'dark');
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: 'Admin', subtitle: '' };

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('niraa_theme', next);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-2)', fontFamily: 'var(--sans)' }}>
      <style>{GLOBAL_CSS}{theme === 'light' ? LIGHT_TOKENS : ''}</style>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title={meta.title} subtitle={meta.subtitle} theme={theme} toggleTheme={toggleTheme} />
        <main style={{ flex: 1, padding: '22px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, change, changeDir, accentVar, loading, index }) => (
  <div className="stat-card animate-in" style={{ animationDelay: `${index * 0.06}s`, '--accent-color': accentVar ? `${accentVar.replace(')', '-dim)')}`.replace('--', '') : 'transparent' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, fontFamily: 'var(--display)' }}>{title}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {loading ? <div className="skeleton" style={{ width: 80, height: 28 }} /> : value}
        </div>
        {!loading && change && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600 }}>
            <span style={{
              color: changeDir === 'up' ? 'var(--green)' : 'var(--red)',
              background: changeDir === 'up' ? 'var(--green-dim)' : 'var(--red-dim)',
              padding: '1px 6px', borderRadius: 99,
            }}>
              {changeDir === 'up' ? '↑' : '↓'} {change}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>vs last week</span>
          </div>
        )}
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: accentVar ? `color-mix(in srgb, ${accentVar} 12%, transparent)` : 'var(--surface-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accentVar || 'var(--text-secondary)',
        border: `1px solid ${accentVar ? `color-mix(in srgb, ${accentVar} 20%, transparent)` : 'var(--border)'}`,
      }}>
        <Ic d={icon} size={18} />
      </div>
    </div>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalProducts: 0, pendingOrders: 0, deliveredOrders: 0, totalSales: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('niraa_token');
        const res = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const formatMoney = (v) => {
    const n = Number(v || 0);
    return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const STAT_CARDS = [
    { title: 'Total Customers', value: stats.totalUsers.toLocaleString(), icon: P.users, accentVar: 'var(--accent)', change: '+12%', changeDir: 'up' },
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: P.box, accentVar: 'var(--purple)', change: '+8%', changeDir: 'up' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: P.clock, accentVar: 'var(--amber)' },
    { title: 'Products', value: stats.totalProducts, icon: P.tag, accentVar: 'var(--blue)' },
    { title: 'Delivered', value: stats.deliveredOrders.toLocaleString(), icon: P.check, accentVar: 'var(--green)', change: '+5%', changeDir: 'up' },
    { title: 'Revenue', value: formatMoney(stats.totalSales), icon: P.trend, accentVar: 'var(--red)', change: '+18%', changeDir: 'up' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Greeting */}
      <div className="animate-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {greeting} 👋
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <Link to="/orders" className="btn btn-primary" style={{ fontSize: 12.5 }}>
          <Ic d={P.plus} size={13} /> New Order
        </Link>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {STAT_CARDS.map((s, i) => <StatCard key={i} index={i} {...s} loading={loading} />)}
      </div>

      {/* Recent orders table */}
      <div className="card animate-in" style={{ animationDelay: '0.4s' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Recent Orders</div>
            <div className="card-subtitle">Latest transactions across all channels</div>
          </div>
          <Link to="/orders" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600, color: 'var(--accent)',
            textDecoration: 'none', padding: '5px 10px',
            background: 'var(--accent-dim)', borderRadius: 'var(--radius)',
            transition: 'opacity 0.15s',
          }}>
            View all <Ic d={P.chevronR} size={12} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 44, animationDelay: `${i * 0.1}s` }} />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>No orders yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Orders will appear here once they come in.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', fontFamily: 'var(--display)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 8).map((order) => {
                  const sm = STATUS[order.status] || { color: 'var(--text-muted)', bg: 'var(--surface-3)', dot: false };
                  return (
                    <tr key={order._id} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', background: 'var(--surface-3)', padding: '2px 8px', borderRadius: 6 }}>
                          #{String(order._id || '').slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {order.customer?.name || order.customerName || 'Guest'}
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                        ₹{Number(order.total || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className="badge" style={{ color: sm.color, background: sm.bg }}>
                          {sm.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.color, display: 'inline-block' }} />}
                          {order.status?.replace(/-/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// AdminMarketing is imported from ./Adminmarketing

// ─── Inventory ────────────────────────────────────────────────────────────────
const AdminInventory = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {[
      { name: 'Floor Cleaner (1lt Refill)', location: 'Dharmapuri Hub', qty: 5, warn: true },
      { name: 'Toilet Cleaner (1lt Bottle)', location: 'Main Warehouse', qty: 42, warn: false },
    ].map((item, i) => (
      <div key={i} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', gap: 16,
        background: 'var(--surface)',
        border: `1px solid ${item.warn ? 'rgba(251,191,36,0.25)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: item.warn ? '0 0 0 1px rgba(251,191,36,0.08) inset' : 'none',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{item.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{item.location}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 15, color: item.warn ? 'var(--amber)' : 'var(--green)' }}>
            {item.qty} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>units</span>
          </span>
          {item.warn && (
            <button className="btn btn-danger" style={{ fontSize: 12, padding: '7px 14px' }}>
              Restock
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
);

// ─── Login ────────────────────────────────────────────────────────────────────
const AdminLogin = ({ setAuth }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('niraa_token', data.token);
        localStorage.setItem('niraa_user', JSON.stringify(data.user));
        localStorage.setItem('niraa_admin_auth', 'true');
        setAuth(true);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid PIN');
        setPin('');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--sans)',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(46,184,154,0.07) 0%, transparent 70%)',
      }} />
      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
        backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <form onSubmit={handleLogin} className="animate-in" style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-active)',
        borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 390,
        position: 'relative',
        boxShadow: '0 4px 6px rgba(0,0,0,0.4), 0 24px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Accent line at top */}
        <div style={{ position: 'absolute', top: 0, left: 40, right: 40, height: 1, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', borderRadius: 99 }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), #1a8a72)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px var(--accent-glow)' }}>
            <span style={{ color: '#021a14', fontWeight: 900, fontSize: 20, fontFamily: 'var(--display)' }}>N</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', color: 'var(--text-primary)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>NIRAA</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Admin Console</div>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>Welcome back</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>Enter your admin PIN to access the console</div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--display)' }}>Admin PIN</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <Ic d={P.shield} size={15} />
            </span>
            <input
              ref={inputRef}
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="••••••"
              className="input"
              style={{ paddingLeft: 38, fontFamily: 'var(--mono)', letterSpacing: 8, fontSize: 18, borderColor: error ? 'var(--red)' : undefined }}
            />
          </div>
          {error && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Ic d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={13} />
              {error}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || !pin} className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: 14 }}>
          {loading ? 'Verifying…' : 'Continue →'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
          Secure admin access · NIRAA v2.0
        </div>
      </form>
    </div>
  );
};

// ─── Routes ───────────────────────────────────────────────────────────────────
export const AdminRoutes = () => {
  const [auth, setAuth] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('niraa_user') || 'null');
      const token = localStorage.getItem('niraa_token');
      const adminAuth = localStorage.getItem('niraa_admin_auth') === 'true';
      return adminAuth && !!token && user?.role === 'admin';
    } catch { return false; }
  });

  if (!auth) {
    return (
      <Routes>
        <Route path="/login" element={<AdminLogin setAuth={setAuth} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/products" element={<AdminProducts />} />
        <Route path="/inventory" element={<AdminInventory />} />
        <Route path="/orders" element={<AdminOrdersPage />} />
        <Route path="/customers" element={<AdminCustomers />} />
        <Route path="/marketing" element={<AdminMarketing />} />
        <Route path="/builder" element={<AdminBuilder />} />
        <Route path="/admin" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AdminLayout>
  );
};