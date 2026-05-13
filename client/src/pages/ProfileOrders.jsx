import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../utils/constants.js';
import Loader from '../components/Loader.jsx';
import { FiPackage, FiChevronDown, FiChevronUp } from 'react-icons/fi';

/* ─── Design Tokens ─────────────────────────────────── */
const T = {
  emerald: '#059669',
  emeraldMid: '#047857',
  emeraldDark: '#064e3b',
  emeraldGlow: 'rgba(5,150,105,0.12)',
  surface: '#ffffff',
  surfaceAlt: '#f8faf9',
  border: '#e4e9e7',
  text: '#0f1a16',
  textSub: '#3d5249',
  textMuted: '#6b7f76',
  textFaint: '#9db0a8',
  gold: '#d97706',
  goldBg: 'rgba(217,119,6,0.08)',
  red: '#dc2626',
  redBg: '#fef2f2',
  font: `'Outfit', 'DM Sans', system-ui, sans-serif`,
  fontDisplay: `'Playfair Display', Georgia, serif`,
};

const STATUS = {
  placed: { color: '#0f766e', bg: '#f0fdf9', label: 'Placed', icon: '🛎️', step: 0 },
  confirmed: { color: '#b45309', bg: '#fffbeb', label: 'Confirmed', icon: '✅', step: 1 },
  packed: { color: '#6d28d9', bg: '#f5f3ff', label: 'Packed', icon: '📦', step: 2 },
  shipped: { color: '#0369a1', bg: '#f0f9ff', label: 'Shipped', icon: '🚢', step: 3 },
  out_for_delivery: { color: '#1d4ed8', bg: '#eff6ff', label: 'Out for Delivery', icon: '🚚', step: 4 },
  delivered: { color: '#15803d', bg: '#f0fdf4', label: 'Delivered', icon: '🎉', step: 5 },
  cancelled: { color: '#dc2626', bg: '#fef2f2', label: 'Cancelled', icon: '❌', step: -1 },
};

const ORDER_STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(32px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes expandDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes progressFill {
    from { width: 0; }
    to   { width: 100%; }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .orders-root {
    font-family: ${T.font};
    background: ${T.surfaceAlt};
    min-height: 100vh;
    padding: 48px 20px 80px;
    color: ${T.text};
  }
  .orders-wrap { max-width: 800px; margin: 0 auto; }

  /* ── Hero Banner ── */
  .orders-hero {
    background: linear-gradient(135deg, #062019 0%, #0b3d2e 55%, #063324 100%);
    border-radius: 28px;
    padding: 32px 32px 28px;
    position: relative;
    overflow: hidden;
    margin-bottom: 24px;
    animation: fadeUp 0.45s ease both;
    box-shadow: 0 12px 40px rgba(6,32,25,0.22);
  }
  .orders-hero::before {
    content: '';
    position: absolute;
    top: -80px; right: -60px;
    width: 240px; height: 240px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }
  .orders-hero::after {
    content: '';
    position: absolute;
    bottom: -50px; left: 40%;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(5,150,105,0.08);
    pointer-events: none;
  }
  .hero-inner {
    position: relative; z-index: 1;
    display: flex; justify-content: space-between;
    align-items: flex-start; flex-wrap: wrap; gap: 16px;
  }
  .hero-eyebrow {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: rgba(160,225,195,0.75);
    margin-bottom: 8px;
  }
  .hero-title {
    font-family: ${T.fontDisplay};
    font-size: 2rem;
    font-weight: 900;
    color: #fff;
    letter-spacing: -.03em;
    line-height: 1;
    margin-bottom: 6px;
  }
  .hero-sub {
    font-size: 13px;
    color: rgba(160,225,195,0.65);
    font-weight: 500;
  }
  .hero-user-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 14px;
    padding: 10px 14px;
    backdrop-filter: blur(8px);
    flex-shrink: 0;
  }
  .hero-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, ${T.gold}, #b45309);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 900; font-size: 14px;
    font-family: ${T.fontDisplay};
    flex-shrink: 0;
  }
  .hero-user-name  { font-size: 13px; font-weight: 700; color: #fff; }
  .hero-user-email { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 1px; }

  /* ── Stats Strip ── */
  .stats-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
    animation: fadeUp 0.45s 0.05s ease both;
  }
  .stat-card {
    background: ${T.surface};
    border: 1.5px solid ${T.border};
    border-radius: 18px;
    padding: 16px 14px;
    text-align: center;
    transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
    cursor: default;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px ${T.emeraldGlow};
    border-color: rgba(5,150,105,0.25);
  }
  .stat-icon { font-size: 1.3rem; margin-bottom: 5px; }
  .stat-value {
    font-family: ${T.fontDisplay};
    font-size: 1.3rem;
    font-weight: 900;
    color: ${T.emeraldDark};
    letter-spacing: -.02em;
    animation: countUp 0.4s ease both;
  }
  .stat-label {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: ${T.textFaint};
    margin-top: 3px;
  }

  /* ── Filter Bar ── */
  .filter-bar {
    background: ${T.surface};
    border: 1.5px solid ${T.border};
    border-radius: 18px;
    padding: 12px 14px;
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    animation: fadeUp 0.45s 0.1s ease both;
  }
  .filter-pill {
    padding: 7px 15px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    border: 1.5px solid ${T.border};
    background: ${T.surface};
    color: ${T.textMuted};
    cursor: pointer;
    font-family: ${T.font};
    transition: all 0.18s;
    white-space: nowrap;
  }
  .filter-pill:hover { border-color: ${T.emerald}; color: ${T.emerald}; }
  .filter-pill.active {
    background: linear-gradient(135deg, ${T.emerald}, ${T.emeraldMid});
    color: #fff;
    border-color: transparent;
    box-shadow: 0 4px 14px ${T.emeraldGlow};
  }

  /* ── Order Cards ── */
  .order-card {
    background: ${T.surface};
    border: 1.5px solid ${T.border};
    border-radius: 22px;
    overflow: hidden;
    transition: box-shadow 0.25s, border-color 0.25s, transform 0.25s;
    animation: fadeUp 0.4s ease both;
  }
  .order-card:hover {
    box-shadow: 0 8px 32px ${T.emeraldGlow};
    border-color: rgba(5,150,105,0.2);
    transform: translateY(-2px);
  }

  .order-header {
    padding: 18px 22px 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }
  .order-id {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .08em;
    color: ${T.textFaint};
    font-family: monospace;
    margin-bottom: 5px;
  }
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    border-width: 1px;
    border-style: solid;
  }
  .order-date {
    font-size: 12px;
    color: ${T.textFaint};
    font-weight: 500;
    margin-top: 4px;
  }
  .order-amount {
    text-align: right;
    flex-shrink: 0;
  }
  .order-total {
    font-family: ${T.fontDisplay};
    font-size: 1.25rem;
    font-weight: 900;
    color: ${T.emeraldDark};
    letter-spacing: -.02em;
  }
  .order-items-count {
    font-size: 11px;
    color: ${T.textFaint};
    font-weight: 600;
    margin-top: 2px;
    text-align: right;
  }

  /* ── Progress Tracker ── */
  .progress-tracker {
    padding: 14px 22px 16px;
    border-top: 1.5px solid ${T.border};
  }
  .progress-steps {
    display: flex;
    align-items: center;
  }
  .step-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
  }
  .step-circle {
    width: 30px; height: 30px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    font-weight: 800;
    transition: all 0.35s;
  }
  .step-name {
    font-size: 9px;
    font-weight: 700;
    text-align: center;
    max-width: 54px;
    line-height: 1.2;
    transition: color 0.3s;
    white-space: nowrap;
  }
  .step-line {
    flex: 1;
    height: 2.5px;
    border-radius: 2px;
    margin-bottom: 19px;
    transition: background 0.5s;
    min-width: 10px;
  }

  /* ── Item rows ── */
  .items-section {
    padding: 4px 22px 14px;
    border-top: 1.5px solid ${T.border};
  }
  .item-row {
    display: flex;
    gap: 13px;
    align-items: center;
    padding: 10px 0;
  }
  .item-thumb {
    width: 52px; height: 52px;
    border-radius: 13px;
    background: linear-gradient(135deg, #f0faf8, #f8fffe);
    border: 1.5px solid ${T.border};
    overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s;
  }
  .item-row:hover .item-thumb { transform: scale(1.05); }
  .item-name {
    font-size: 13px;
    font-weight: 700;
    color: ${T.text};
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item-qty {
    font-size: 12px;
    color: ${T.textMuted};
    font-weight: 500;
  }
  .item-price {
    font-size: 13px;
    font-weight: 800;
    color: ${T.text};
    flex-shrink: 0;
    margin-left: auto;
  }
  .item-divider {
    height: 1px;
    background: ${T.border};
    opacity: 0.6;
  }
  .expand-btn {
    width: 100%;
    padding: 10px;
    margin-top: 6px;
    background: ${T.emeraldGlow};
    border: 1.5px dashed rgba(5,150,105,0.25);
    border-radius: 13px;
    color: ${T.emerald};
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    font-family: ${T.font};
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.2s;
  }
  .expand-btn:hover { background: rgba(5,150,105,0.18); border-color: rgba(5,150,105,0.4); }

  /* ── Order Footer ── */
  .order-footer {
    padding: 13px 22px;
    background: ${T.surfaceAlt};
    border-top: 1.5px solid ${T.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .meta-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: ${T.textMuted};
    background: ${T.surface};
    border: 1px solid ${T.border};
    padding: 4px 10px;
    border-radius: 999px;
  }
  .footer-total {
    font-family: ${T.fontDisplay};
    font-size: 14px;
    font-weight: 900;
    color: ${T.emeraldDark};
  }

  /* ── Cancellation Zone ── */
  .cancel-zone {
    padding: 12px 22px 16px;
    border-top: 1.5px solid ${T.border};
  }
  .cancel-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .cancel-info {
    font-size: 12px;
    color: ${T.textMuted};
    font-weight: 500;
  }
  .cancel-info .ok  { color: #15803d; font-weight: 700; }
  .cancel-info .warn { color: #b45309; font-weight: 700; }
  .cancel-btn {
    padding: 8px 18px;
    border-radius: 11px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    font-family: ${T.font};
    transition: all 0.2s;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .cancel-btn.red   { border: 1.5px solid rgba(220,38,38,0.2); background: #fef2f2; color: #dc2626; }
  .cancel-btn.red:hover:not(:disabled)   { background: #fee2e2; border-color: rgba(220,38,38,0.4); transform: translateY(-1px); }
  .cancel-btn.amber { border: 1.5px solid rgba(180,83,9,0.2);  background: #fffbeb; color: #b45309; }
  .cancel-btn.amber:hover:not(:disabled) { background: #fef3c7; border-color: rgba(180,83,9,0.4); transform: translateY(-1px); }
  .cancel-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .cancel-requested-tag {
    font-size: 11px;
    color: #b45309;
    font-weight: 800;
    background: #fffbeb;
    border: 1px solid rgba(180,83,9,0.2);
    border-radius: 9px;
    padding: 6px 12px;
  }
  .delivery-notice {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: ${T.surfaceAlt};
    border: 1.5px solid ${T.border};
    border-radius: 12px;
  }
  .delivery-notice-title  { font-size: 12px; font-weight: 800; color: ${T.text}; }
  .delivery-notice-detail { font-size: 11px; color: ${T.textMuted}; margin-top: 2px; line-height: 1.5; }

  /* ── Cancelled banner ── */
  .cancelled-banner {
    padding: 10px 22px;
    background: #fef2f2;
    border-top: 1.5px solid rgba(220,38,38,0.12);
    display: flex; align-items: center; gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #dc2626;
  }

  /* ── Empty state ── */
  .empty-state {
    background: ${T.surface};
    border: 1.5px solid ${T.border};
    border-radius: 24px;
    padding: 70px 40px;
    text-align: center;
    animation: scaleIn 0.4s ease both;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .empty-icon { font-size: 4.5rem; margin-bottom: 18px; }
  .empty-title {
    font-family: ${T.fontDisplay};
    font-size: 1.45rem;
    font-weight: 900;
    color: ${T.text};
    margin-bottom: 10px;
    letter-spacing: -.02em;
  }
  .empty-sub {
    font-size: 14px;
    color: ${T.textMuted};
    line-height: 1.7;
    max-width: 320px;
    margin: 0 auto 28px;
  }
  .shop-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px;
    background: linear-gradient(135deg, ${T.emerald}, ${T.emeraldMid});
    color: #fff;
    text-decoration: none;
    border-radius: 16px;
    font-weight: 800;
    font-size: 14px;
    font-family: ${T.font};
    box-shadow: 0 8px 24px ${T.emeraldGlow};
    transition: all 0.2s;
  }
  .shop-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px ${T.emeraldGlow}; }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(6,32,25,0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
    backdrop-filter: blur(6px);
    animation: fadeIn 0.2s ease;
  }
  .modal-box {
    background: ${T.surface};
    border-radius: 24px;
    width: 100%;
    max-width: 430px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,0.32);
    animation: modalIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .modal-head {
    padding: 24px 24px 14px;
    border-bottom: 1.5px solid ${T.border};
  }
  .modal-title {
    font-family: ${T.fontDisplay};
    font-size: 1.25rem;
    font-weight: 900;
    color: ${T.text};
    letter-spacing: -.02em;
    margin-bottom: 4px;
  }
  .modal-meta {
    font-size: 12px;
    color: ${T.textMuted};
    font-weight: 600;
  }
  .modal-body { padding: 16px 24px; }
  .reason-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 14px;
    border: 2px solid ${T.border};
    background: ${T.surfaceAlt};
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 9px;
  }
  .reason-option.selected {
    border-color: ${T.emerald};
    background: ${T.emeraldGlow};
  }
  .reason-option input[type="radio"] { accent-color: ${T.emerald}; width: 17px; height: 17px; cursor: pointer; }
  .reason-label { font-size: 13px; font-weight: 700; transition: color 0.2s; }
  .reason-option.selected .reason-label { color: ${T.emeraldMid}; }
  .other-textarea {
    width: 100%;
    padding: 13px 14px;
    border-radius: 13px;
    border: 1.5px solid ${T.border};
    background: ${T.surface};
    font-size: 13px;
    font-family: ${T.font};
    min-height: 80px;
    resize: none;
    outline: none;
    transition: border-color 0.18s;
    margin-top: 6px;
    animation: expandDown 0.25s ease;
  }
  .other-textarea:focus { border-color: ${T.emerald}; }
  .char-count { display: flex; justify-content: space-between; font-size: 10px; color: ${T.textFaint}; font-weight: 700; margin-top: 5px; }
  .modal-foot {
    padding: 14px 24px 20px;
    display: flex;
    gap: 10px;
    background: ${T.surfaceAlt};
    border-top: 1.5px solid ${T.border};
  }
  .modal-keep-btn {
    flex: 1; padding: 14px;
    border-radius: 14px;
    border: 1.5px solid ${T.border};
    background: ${T.surface};
    color: ${T.textSub};
    font-weight: 800; font-size: 13px;
    cursor: pointer; font-family: ${T.font};
    transition: all 0.2s;
  }
  .modal-keep-btn:hover { background: ${T.surfaceAlt}; border-color: ${T.textFaint}; }
  .modal-confirm-btn {
    flex: 1.5; padding: 14px;
    border-radius: 14px;
    border: none;
    font-weight: 800; font-size: 13px;
    cursor: pointer; font-family: ${T.font};
    transition: all 0.2s;
  }
  .modal-confirm-btn.active { background: #dc2626; color: #fff; box-shadow: 0 8px 20px rgba(220,38,38,0.25); }
  .modal-confirm-btn.active:hover { transform: translateY(-1px); box-shadow: 0 12px 24px rgba(220,38,38,0.32); }
  .modal-confirm-btn.inactive { background: ${T.border}; color: ${T.textFaint}; cursor: not-allowed; }
  .spinner-sm {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.7s linear infinite;
    vertical-align: -2px;
    margin-right: 6px;
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .stats-strip { grid-template-columns: repeat(2, 1fr); }
    .orders-hero { padding: 22px 18px 20px; border-radius: 20px; }
    .hero-title { font-size: 1.6rem; }
    .order-header { padding: 14px 16px 12px; }
    .progress-tracker { padding: 12px 14px 14px; }
    .items-section { padding: 4px 16px 12px; }
    .order-footer { padding: 10px 16px; }
    .cancel-zone { padding: 10px 16px 14px; }
  }
`;

/* ─── Cancellation Modal ─────────────────────────────── */
function CancellationModal({ order, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [otherText, setOtherText] = useState('');
  const [loading, setLoading] = useState(false);

  const REASONS = [
    { key: 'changed_mind', label: 'Changed my mind' },
    { key: 'wrong_item', label: 'Ordered the wrong item' },
    { key: 'better_price', label: 'Found a better price elsewhere' },
    { key: 'too_long', label: 'Delivery is taking too long' },
    { key: 'other', label: 'Other reason' },
  ];

  const isValid = reason && (reason !== 'other' || otherText.trim().length >= 5);
  const shortId = order._id?.slice(-8).toUpperCase();
  const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0);

  const handleConfirm = async () => {
    if (!isValid) return;
    setLoading(true);
    await onConfirm(order._id, reason, otherText);
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <div className="modal-title">Why are you cancelling?</div>
          <div className="modal-meta">Order #{shortId} · {itemCount} items · ₹{order.total ?? order.totalAmount}</div>
        </div>

        <div className="modal-body">
          {REASONS.map(r => (
            <label key={r.key} className={`reason-option${reason === r.key ? ' selected' : ''}`}>
              <input type="radio" name="cancelReason" checked={reason === r.key} onChange={() => setReason(r.key)} />
              <span className="reason-label">{r.label}</span>
            </label>
          ))}

          {reason === 'other' && (
            <div>
              <textarea
                className="other-textarea"
                placeholder="Please tell us more (at least 5 characters)…"
                value={otherText}
                onChange={e => setOtherText(e.target.value.slice(0, 200))}
              />
              <div className="char-count">
                <span>{otherText.length > 0 && otherText.length < 5 ? `${5 - otherText.length} more characters needed` : ''}</span>
                <span>{otherText.length}/200</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="modal-keep-btn" onClick={onClose}>Keep order</button>
          <button
            className={`modal-confirm-btn ${isValid && !loading ? 'active' : 'inactive'}`}
            disabled={!isValid || loading}
            onClick={handleConfirm}
          >
            {loading ? <><span className="spinner-sm" />Cancelling…</> : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Order Card ─────────────────────────────────────── */
function OrderCard({ order, onCancel, animDelay }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS[order.status] || STATUS.placed;
  const currentStep = cfg.step;
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="order-card" style={{ animationDelay: `${animDelay}ms` }}>

      {/* Header */}
      <div className="order-header">
        <div>
          <div className="order-id">#{order._id?.slice(-8).toUpperCase()}</div>
          <span
            className="status-badge"
            style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}30` }}
          >
            {cfg.icon} {cfg.label}
          </span>
          <div className="order-date">
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>
        <div className="order-amount">
          <div className="order-total">₹{order.total ?? order.totalAmount ?? 0}</div>
          <div className="order-items-count">{order.items?.reduce((s, i) => s + i.quantity, 0)} items</div>
        </div>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="progress-tracker">
          <div className="progress-steps">
            {ORDER_STEPS.map((step, idx) => {
              const sc = STATUS[step];
              const done = currentStep > sc.step;
              const active = currentStep === sc.step;
              const isLast = idx === ORDER_STEPS.length - 1;
              return (
                <React.Fragment key={step}>
                  <div className="step-node">
                    <div className="step-circle" style={{
                      background: done ? T.emerald : active ? cfg.bg : T.surfaceAlt,
                      border: `2px solid ${done || active ? (done ? T.emerald : cfg.color) : T.border}`,
                      color: done ? '#fff' : active ? cfg.color : T.textFaint,
                      boxShadow: active ? `0 0 0 5px ${cfg.color}18` : 'none',
                      fontSize: done ? '13px' : '12px',
                    }}>
                      {done ? '✓' : <span>{sc.icon}</span>}
                    </div>
                    <div className="step-name" style={{ color: done || active ? (done ? T.emeraldMid : cfg.color) : T.textFaint, fontWeight: active ? 800 : 600 }}>
                      {sc.label}
                    </div>
                  </div>
                  {!isLast && (
                    <div className="step-line" style={{ background: done ? T.emerald : T.border }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="cancelled-banner">
          ❌ This order has been cancelled
        </div>
      )}

      {/* Items */}
      <div className="items-section">
        {order.items?.slice(0, expanded ? order.items.length : 2).map((item, idx) => {
          const img = item.image || item.images?.[0] || null;
          const total = (item.price ?? 0) * (item.quantity ?? 1);
          const isLast = idx < (expanded ? order.items.length - 1 : Math.min(2, order.items.length) - 1);
          return (
            <React.Fragment key={idx}>
              <div className="item-row">
                <div className="item-thumb">
                  {img
                    ? <img src={img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '1.4rem' }}>🧴</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="item-name">{item.name}</div>
                  <div className="item-qty">{item.quantity} × ₹{item.price}</div>
                </div>
                <div className="item-price">₹{total}</div>
              </div>
              {isLast && <div className="item-divider" />}
            </React.Fragment>
          );
        })}

        {order.items?.length > 2 && (
          <button className="expand-btn" onClick={() => setExpanded(v => !v)}>
            {expanded
              ? <><FiChevronUp size={14} /> Show less</>
              : <><FiChevronDown size={14} /> +{order.items.length - 2} more items</>
            }
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="order-footer">
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {order.paymentMethod && (
            <span className="meta-pill">💳 {order.paymentMethod}</span>
          )}
          {order.address?.city && (
            <span className="meta-pill">📍 {order.address.city}</span>
          )}
        </div>
        <div className="footer-total">Total: ₹{order.total ?? order.totalAmount ?? 0}</div>
      </div>

      {/* Cancellation Zone */}
      {!isCancelled && order.status !== 'delivered' && (
        <div className="cancel-zone">
          {['placed', 'confirmed', 'packed'].includes(order.status) ? (
            <div className="cancel-row">
              <div className="cancel-info">
                <span className="ok">✓ 100% Refund</span> · No processing begun
              </div>
              <button className="cancel-btn red" onClick={() => onCancel(order)}>
                Cancel Order
              </button>
            </div>
          ) : order.status === 'shipped' ? (
            <div>
              <div className="cancel-row" style={{ marginBottom: 8 }}>
                <div className="cancel-info">
                  <span className="warn">⚠ Conditional Refund</span> · Shipping fees may apply
                </div>
                {order.cancellationRequested ? (
                  <span className="cancel-requested-tag">Cancellation Requested</span>
                ) : (
                  <button className="cancel-btn amber" onClick={() => onCancel(order)}>
                    Request Cancellation
                  </button>
                )}
              </div>
              <p style={{ fontSize: 11, color: T.textFaint, fontStyle: 'italic', lineHeight: 1.5 }}>
                We'll try to intercept the courier. If unsuccessful, you may need to refuse delivery at your doorstep.
              </p>
            </div>
          ) : order.status === 'out_for_delivery' ? (
            <div className="delivery-notice">
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🚚</span>
              <div>
                <div className="delivery-notice-title">Too late to cancel?</div>
                <div className="delivery-notice-detail">The driver is on the way. Refuse delivery at your doorstep to initiate a return/refund.</div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
const ProfileOrders = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);

  useEffect(() => { fetchOrders(); }, [user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('niraa_token');
      if (!token) { setLoading(false); return; }
      const res = await fetch(`${API_BASE_URL}/orders/my`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else if (res.status === 401) {
        logout();
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, reasonKey, reasonText) => {
    try {
      const token = localStorage.getItem('niraa_token');
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reasonKey, reasonText })
      });
      if (res.ok) {
        await fetchOrders();
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to cancel order');
      }
    } catch { alert('Error connecting to server'); }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = filter === 'all' ? safeOrders : safeOrders.filter(o => o.status === filter);

  const stats = {
    total: safeOrders.length,
    delivered: safeOrders.filter(o => o.status === 'delivered').length,
    active: safeOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
    totalSpent: safeOrders.reduce((s, o) => s + (o.total ?? o.totalAmount ?? 0), 0),
  };

  const FILTERS = [
    { id: 'all', label: '🏠 All' },
    { id: 'placed', label: '🛎️ Placed' },
    { id: 'confirmed', label: '✅ Confirmed' },
    { id: 'packed', label: '📦 Packed' },
    { id: 'shipped', label: '🚢 Shipped' },
    { id: 'out_for_delivery', label: '🚚 Out for Delivery' },
    { id: 'delivered', label: '🎉 Delivered' },
    { id: 'cancelled', label: '❌ Cancelled' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="orders-root">
      <style>{GLOBAL_CSS}</style>
      <div className="orders-wrap">

        {/* ── Hero Banner ── */}
        <div className="orders-hero">
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow">Your Account</div>
              <h1 className="hero-title">My Orders</h1>
              <p className="hero-sub">Track and manage all your NIRAA orders</p>
            </div>
            {user?.name && (
              <div className="hero-user-chip">
                <div className="hero-avatar">{user.name[0].toUpperCase()}</div>
                <div>
                  <div className="hero-user-name">{user.name}</div>
                  <div className="hero-user-email">{user.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {safeOrders.length > 0 && (
          <>
            {/* ── Stats Strip ── */}
            <div className="stats-strip">
              {[
                { label: 'Total Orders', value: stats.total, icon: '📦' },
                { label: 'Delivered', value: stats.delivered, icon: '✅' },
                { label: 'Active', value: stats.active, icon: '🚚' },
                { label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString('en-IN')}`, icon: '💰' },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── Filter Bar ── */}
            <div className="filter-bar">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  className={`filter-pill${filter === f.id ? ' active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Orders List ── */}
        {safeOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-title">No orders yet</div>
            <p className="empty-sub">You haven't placed any orders. Start exploring our products and place your first order!</p>
            <Link to="/products" className="shop-btn">
              <FiPackage size={17} /> Browse Products
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state" style={{ padding: '50px 30px' }}>
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No orders found</div>
            <p className="empty-sub">No orders match the selected filter.</p>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '11px 24px',
                background: T.emerald, color: '#fff',
                border: 'none', borderRadius: 13,
                fontWeight: 800, fontSize: 13,
                cursor: 'pointer', fontFamily: T.font,
              }}
            >
              View All Orders
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredOrders.map((order, i) => (
              <OrderCard
                key={order._id}
                order={order}
                onCancel={setSelectedOrderForCancel}
                animDelay={i * 60}
              />
            ))}
          </div>
        )}

        {/* ── Cancellation Modal ── */}
        {selectedOrderForCancel && (
          <CancellationModal
            order={selectedOrderForCancel}
            onClose={() => setSelectedOrderForCancel(null)}
            onConfirm={handleCancelOrder}
          />
        )}

      </div>
    </div>
  );
};

export default ProfileOrders;