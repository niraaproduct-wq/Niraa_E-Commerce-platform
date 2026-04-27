import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice.js';
import { API_BASE_URL } from '../utils/constants.js';

/* ─── tiny SVG icon set (no extra dependency) ─────────────────────────── */
const Icon = {
  Search: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Refresh: ({ spin }) => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
      style={{ animation: spin ? 'spin 1s linear infinite' : 'none' }}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  ChevronUp: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="m18 15-6-6-6 6" />
    </svg>
  ),
  Phone: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  CreditCard: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
    </svg>
  ),
  Package: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  ),
  Clock: () => (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  Alert: () => (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1-4a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v4z" />
    </svg>
  ),
  Filter: () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Whatsapp: () => (
    <svg width="15" height="15" viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.469 2.025 7.766L0 32l8.469-2.217A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.328 22.563c-.344.969-2.012 1.875-2.762 1.937-.75.063-1.469.313-4.969-1.031-4.188-1.594-6.844-5.875-7.063-6.156-.219-.281-1.781-2.375-1.781-4.531s1.125-3.219 1.531-3.656c.406-.438.875-.563 1.156-.563.281 0 .563 0 .813.016.25.016.594-.094.938.719.344.813 1.156 2.813 1.25 3.031.094.219.156.469.031.75-.125.281-.188.469-.375.688-.188.219-.406.5-.563.656-.188.188-.375.406-.188.781.188.375.844 1.406 1.813 2.281 1.25 1.125 2.313 1.469 2.688 1.656.375.188.594.156.813-.094.219-.25.938-1.094 1.188-1.469.25-.375.5-.313.844-.188.344.125 2.188 1.031 2.563 1.219.375.188.625.281.719.438.094.156.094.906-.25 1.875z" />
    </svg>
  ),
  Print: () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  Star: () => (
    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  SortDesc: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 4v16" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
};

/* ─── constants ────────────────────────────────────────────────────────── */
const STATUS_META = {
  placed: { label: 'Placed', emoji: '🛎️', bg: '#f0fdf9', fg: '#0f766e', border: '#99f6e4', dot: '#0d9488' },
  confirmed: { label: 'Confirmed', emoji: '✅', bg: '#fffbeb', fg: '#b45309', border: '#fde68a', dot: '#d97706' },
  'out-for-delivery': { label: 'Out for Delivery', emoji: '🚴', bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' },
  delivered: { label: 'Delivered', emoji: '🎉', bg: '#f0fdf4', fg: '#15803d', border: '#bbf7d0', dot: '#22c55e' },
  cancelled: { label: 'Cancelled', emoji: '❌', bg: '#fff1f2', fg: '#be123c', border: '#fecdd3', dot: '#f43f5e' },
};

const STATUS_ORDER = ['placed', 'confirmed', 'out-for-delivery', 'delivered'];
const ALL_STATUSES = ['placed', 'confirmed', 'out-for-delivery', 'delivered', 'cancelled'];

const NEXT_STATUS = {
  placed: 'confirmed',
  confirmed: 'out-for-delivery',
  'out-for-delivery': 'delivered',
};

const NEXT_LABEL = {
  placed: '✅ Confirm Order',
  confirmed: '🚴 Mark Out for Delivery',
  'out-for-delivery': '🎉 Mark Delivered',
};

/* ─── helpers ──────────────────────────────────────────────────────────── */
const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const isUrgent = (iso) => {
  if (!iso) return false;
  const m = (Date.now() - new Date(iso).getTime()) / 60000;
  return m > 30;
};

const normalizePhone = (p) => String(p || '').replace(/[^0-9]/g, '');

const waLink = (o) => {
  const msg = `Hi ${o.customerName || ''} 👋\n\nYour NIRAA order *#${o._id?.slice(-8)}* update:\n\n📦 Status: *${STATUS_META[o.status]?.label || o.status}*\n💰 Total: ${formatPrice(o.total)}\n\nThank you for shopping with NIRAA! 🛍️`;
  return `https://wa.me/${normalizePhone(o.customerPhone)}?text=${encodeURIComponent(msg)}`;
};

/* ─── sub-components ───────────────────────────────────────────────────── */

function StatCard({ label, value, sub, color, bg }) {
  return (
    <div style={{
      background: bg || '#fff',
      border: `1px solid ${color}33`,
      borderRadius: 14,
      padding: '14px 18px',
      minWidth: 110,
      flex: 1,
    }}>
      <div style={{ fontSize: '1.55rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginTop: 4 }}>{label}</div>
      {sub != null && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StatusTimeline({ current }) {
  const idx = STATUS_ORDER.indexOf(current);
  const cancelled = current === 'cancelled';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 10, marginBottom: 4, flexWrap: 'nowrap', overflowX: 'auto' }}>
      {STATUS_ORDER.map((s, i) => {
        const meta = STATUS_META[s];
        const done = !cancelled && i <= idx;
        const active = !cancelled && i === idx;
        return (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 60 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: done ? meta.dot : '#e5e7eb',
                border: active ? `3px solid ${meta.dot}` : '2px solid transparent',
                boxShadow: active ? `0 0 0 3px ${meta.dot}33` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}>
                {done && <svg width="12" height="12" fill="#fff" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /><path fill="none" stroke="#fff" strokeWidth="3" d="M20 6 9 17l-5-5" /></svg>}
              </div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: done ? meta.fg : '#9ca3af', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {meta.emoji} {meta.label.split(' ')[0]}
              </div>
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 12,
                background: !cancelled && i < idx ? `linear-gradient(90deg,${STATUS_META[STATUS_ORDER[i]].dot},${STATUS_META[STATUS_ORDER[i + 1]].dot})` : '#e5e7eb',
                borderRadius: 2, marginBottom: 14,
              }} />
            )}
          </React.Fragment>
        );
      })}
      {cancelled && (
        <div style={{ marginLeft: 12, padding: '2px 10px', background: STATUS_META.cancelled.bg, color: STATUS_META.cancelled.fg, border: `1px solid ${STATUS_META.cancelled.border}`, borderRadius: 99, fontSize: '0.73rem', fontWeight: 800 }}>
          ❌ Cancelled
        </div>
      )}
    </div>
  );
}

function OrderCard({ order: o, onStatusChange, updating }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const meta = STATUS_META[o.status] || {};
  const urgent = isUrgent(o.createdAt) && ['placed', 'confirmed'].includes(o.status);
  const next = NEXT_STATUS[o.status];
  const shortId = o._id?.slice(-8)?.toUpperCase();

  const handleConfirm = () => {
    onStatusChange(o._id, confirmStatus);
    setConfirmStatus(null);
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      border: urgent ? '1.5px solid #fca5a5' : '1px solid #e5e7eb',
      boxShadow: urgent ? '0 4px 24px #fca5a533' : '0 2px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      animation: 'slideIn 0.25s ease',
      position: 'relative',
    }}>
      {/* ── urgent stripe ── */}
      {urgent && (
        <div style={{
          background: 'linear-gradient(90deg,#ef4444,#f97316)',
          height: 3,
          position: 'absolute', top: 0, left: 0, right: 0,
        }} />
      )}

      {/* ── confirm dialog overlay ── */}
      {confirmStatus && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
          borderRadius: 18, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: '22px 24px', maxWidth: 300, width: '90%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{STATUS_META[confirmStatus]?.emoji}</div>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: '1.05rem', marginBottom: 6 }}>
              Confirm Status Change
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: 18 }}>
              Mark order <strong>#{shortId}</strong> as <strong style={{ color: STATUS_META[confirmStatus]?.fg }}>{STATUS_META[confirmStatus]?.label}</strong>?
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmStatus(null)} style={{
                padding: '8px 18px', borderRadius: 10, border: '1px solid #e5e7eb',
                background: '#f9fafb', color: '#374151', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
              }}>Cancel</button>
              <button onClick={handleConfirm} style={{
                padding: '8px 18px', borderRadius: 10, border: 'none',
                background: STATUS_META[confirmStatus]?.dot, color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem',
              }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '16px 18px' }}>
        {/* ── header row ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 900, color: '#111827', fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                #{shortId}
              </span>
              <span style={{
                padding: '4px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800,
                background: meta.bg, color: meta.fg, border: `1px solid ${meta.border}`,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.dot, display: 'inline-block' }} />
                {meta.label}
              </span>
              {urgent && (
                <span style={{
                  padding: '3px 9px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 800,
                  background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Icon.Alert /> Waiting
                </span>
              )}
            </div>
            <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: '0.8rem' }}>
              <Icon.Clock /> {timeAgo(o.createdAt)}
              {o.createdAt && <span style={{ color: '#d1d5db' }}>•</span>}
              <span style={{ color: '#9ca3af' }}>{o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f766e' }}>{formatPrice(o.total)}</div>
            <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: 2 }}>{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* ── customer info ── */}
        <div style={{
          marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 12,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer</div>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.92rem', marginTop: 1 }}>{o.customerName || '—'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: '0.82rem', marginTop: 2 }}>
              <Icon.Phone /> {o.customerPhone}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deliver to</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, color: '#374151', fontSize: '0.82rem', marginTop: 2, fontWeight: 600 }}>
              <Icon.MapPin />
              <span style={{ lineHeight: 1.4 }}>{o.address?.street || '-'}, {o.address?.city || '-'} {o.address?.pincode ? `- ${o.address.pincode}` : ''}</span>
            </div>
          </div>
        </div>

        {/* ── payment row ── */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
            background: o.paymentMethod === 'cod' ? '#fef9c3' : '#ede9fe',
            color: o.paymentMethod === 'cod' ? '#92400e' : '#5b21b6',
            border: o.paymentMethod === 'cod' ? '1px solid #fde68a' : '1px solid #ddd6fe',
          }}>
            <Icon.CreditCard /> {o.paymentMethod?.toUpperCase() || 'N/A'}
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
            background: o.paymentStatus === 'paid' ? '#f0fdf4' : '#fff7ed',
            color: o.paymentStatus === 'paid' ? '#15803d' : '#c2410c',
            border: o.paymentStatus === 'paid' ? '1px solid #bbf7d0' : '1px solid #fed7aa',
          }}>
            {o.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Payment pending'}
          </span>
          {o.viaWhatsApp && (
            <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
              📱 WhatsApp order
            </span>
          )}
        </div>

        {/* ── status timeline ── */}
        <StatusTimeline current={o.status} />

        {/* ── quick action: next step ── */}
        {next && (
          <button
            disabled={updating}
            onClick={() => setConfirmStatus(next)}
            style={{
              width: '100%', marginTop: 10, padding: '11px 0',
              background: `linear-gradient(135deg,${STATUS_META[next].dot},${STATUS_META[next].dot}cc)`,
              color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 800, fontSize: '0.88rem', cursor: updating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: updating ? 0.6 : 1, transition: 'opacity 0.2s',
              boxShadow: `0 4px 12px ${STATUS_META[next].dot}44`,
            }}
          >
            {updating ? '⏳ Updating…' : <>{NEXT_LABEL[o.status]} <Icon.ArrowRight /></>}
          </button>
        )}

        {/* ── action row (WhatsApp + expand) ── */}
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <a href={waLink(o)} target="_blank" rel="noreferrer" style={{
            flex: 1, padding: '9px 0',
            background: '#25D366', color: '#fff', borderRadius: 11, fontWeight: 800,
            fontSize: '0.82rem', textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon.Whatsapp /> WhatsApp Customer
          </a>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              padding: '9px 14px', background: '#f1f5f9', border: 'none', borderRadius: 11,
              color: '#475569', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <Icon.Package /> Items {expanded ? <Icon.ChevronUp /> : <Icon.ChevronDown />}
          </button>
        </div>

        {/* ── items list (expandable) ── */}
        {expanded && (
          <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'grid', gap: 8 }}>
            {(o.items || []).map((it, idx) => (
              <div key={`${it.product || it._id || idx}`} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 10, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {it.name || it.product?.name || 'Product'}
                  </div>
                  <div style={{ color: '#6b7280', fontWeight: 600, fontSize: '0.78rem', marginTop: 2 }}>
                    Qty: {it.quantity} × {formatPrice(it.price)}
                  </div>
                </div>
                <div style={{ fontWeight: 900, color: '#0f766e', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                  {formatPrice(Number(it.price || 0) * Number(it.quantity || 0))}
                </div>
              </div>
            ))}
            {/* sub-totals */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontWeight: 900, color: '#111827', fontSize: '0.95rem', borderTop: '1px dashed #e5e7eb', marginTop: 4 }}>
              <span>Order Total</span>
              <span style={{ color: '#0f766e' }}>{formatPrice(o.total)}</span>
            </div>
          </div>
        )}

        {/* ── all statuses ── */}
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#9ca3af', userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon.Filter /> Manual status override
          </summary>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {ALL_STATUSES.map(s => {
              const sm = STATUS_META[s];
              const active = o.status === s;
              return (
                <button key={s} type="button"
                  disabled={updating || active}
                  onClick={() => setConfirmStatus(s)}
                  style={{
                    padding: '6px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 800,
                    border: active ? `1.5px solid ${sm.dot}` : '1px solid #e5e7eb',
                    background: active ? sm.bg : '#f9fafb',
                    color: active ? sm.fg : '#6b7280',
                    cursor: updating || active ? 'not-allowed' : 'pointer',
                    opacity: updating ? 0.6 : 1,
                  }}>
                  {sm.emoji} {sm.label}
                </button>
              );
            })}
          </div>
        </details>
      </div>
    </div>
  );
}

/* ─── main component ───────────────────────────────────────────────────── */
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [seenIds, setSeenIds] = useState(new Set());
  const [newCount, setNewCount] = useState(0);
  const timerRef = useRef(null);
  const prevOrderIds = useRef(new Set());

  const getToken = () => localStorage.getItem('niraa_token');
  const user = JSON.parse(localStorage.getItem('niraa_user') || 'null');
  const isAdmin = user?.role === 'admin';

  /* ── fetch orders ── */
  const fetchOrders = useCallback(async (quiet = false) => {
    if (!isAdmin) return;
    quiet ? setRefreshing(true) : setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      const list = data || [];

      // detect genuinely new orders
      if (quiet && prevOrderIds.current.size > 0) {
        const incoming = list.filter(o => !prevOrderIds.current.has(o._id));
        if (incoming.length) {
          setNewCount(incoming.length);
          toast(`🛎️ ${incoming.length} new order${incoming.length > 1 ? 's' : ''}!`, { icon: '🔔', duration: 5000 });
          try { new Audio('https://actions.google.com/sounds/v1/cartoon/bell_boioioing.ogg').play(); } catch (_) { }
        }
      }
      prevOrderIds.current = new Set(list.map(o => o._id));
      setOrders(list);
    } catch (err) {
      if (!quiet) toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ── auto refresh every 45 s ── */
  useEffect(() => {
    timerRef.current = setInterval(() => fetchOrders(true), 45000);
    return () => clearInterval(timerRef.current);
  }, [fetchOrders]);

  /* ── update status ── */
  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || 'Update failed');
      setOrders(list => list.map(o => o._id === updated._id ? updated : o));
      toast.success(`${STATUS_META[status]?.emoji} Order marked as ${STATUS_META[status]?.label}`);
      setNewCount(0);
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── stats ── */
  const stats = useMemo(() => {
    const s = { all: orders.length, revenue: 0 };
    ALL_STATUSES.forEach(k => { s[k] = 0; });
    orders.forEach(o => {
      s[o.status] = (s[o.status] || 0) + 1;
      if (o.status !== 'cancelled') s.revenue += Number(o.total || 0);
    });
    return s;
  }, [orders]);

  /* ── filtered + sorted orders ── */
  const displayed = useMemo(() => {
    let list = orders;
    if (filterStatus !== 'all') list = list.filter(o => o.status === filterStatus);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o =>
        o._id?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.includes(q) ||
        o.address?.city?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return Number(b.total) - Number(a.total);
      if (sortBy === 'lowest') return Number(a.total) - Number(b.total);
      return 0;
    });
  }, [orders, filterStatus, search, sortBy]);

  const urgentCount = useMemo(
    () => orders.filter(o => isUrgent(o.createdAt) && ['placed', 'confirmed'].includes(o.status)).length,
    [orders]
  );

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .ao-filter-tab { transition: all 0.18s; }
        .ao-filter-tab:hover { background:#f1f5f9 !important; }
        .ao-filter-tab.active { background:#0f766e !important; color:#fff !important; }
        .ao-sort-btn:hover { background:#e5e7eb !important; }
        input[type=text]:focus { outline:none; border-color:#0f766e !important; box-shadow:0 0 0 3px #0f766e22 !important; }
      `}</style>

      <div style={{ padding: '18px 16px', maxWidth: 760, margin: '0 auto', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

        {/* ── not admin banner ── */}
        {!isAdmin && (
          <div style={{ marginBottom: 14, color: '#9f1239', background: '#fff1f2', border: '1px solid #fecdd3', padding: '12px 16px', borderRadius: 12, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Icon.Alert /> Admin access required. Please login with an admin account.
          </div>
        )}

        {/* ── page title + refresh ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#0f766e', letterSpacing: '-0.02em' }}>
              Orders
              {newCount > 0 && (
                <span style={{
                  marginLeft: 10, padding: '2px 9px', borderRadius: 99, fontSize: '0.78rem',
                  background: '#ef4444', color: '#fff', fontWeight: 800,
                  animation: 'pulse 1.5s ease infinite',
                }}>{newCount} new</span>
              )}
            </h2>
            <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 3 }}>
              {urgentCount > 0
                ? <span style={{ color: '#ef4444', fontWeight: 700 }}>⚠️ {urgentCount} order{urgentCount > 1 ? 's' : ''} waiting &gt;30 min</span>
                : <span>{stats.all} total order{stats.all !== 1 ? 's' : ''}</span>
              }
            </div>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            style={{
              padding: '10px 16px', borderRadius: 12, border: '1px solid #e5e7eb',
              background: '#fff', color: '#374151', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.85rem',
            }}
          >
            <Icon.Refresh spin={refreshing} /> {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* ── stats bar ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <StatCard label="Revenue" value={formatPrice(stats.revenue)} sub="(non-cancelled)" color="#0f766e" bg="#f0fdf9" />
          <StatCard label="Placed" value={stats.placed || 0} color={STATUS_META.placed.dot} bg={STATUS_META.placed.bg} />
          <StatCard label="Confirmed" value={stats.confirmed || 0} color={STATUS_META.confirmed.dot} bg={STATUS_META.confirmed.bg} />
          <StatCard label="Delivering" value={stats['out-for-delivery'] || 0} color={STATUS_META['out-for-delivery'].dot} bg={STATUS_META['out-for-delivery'].bg} />
          <StatCard label="Delivered" value={stats.delivered || 0} color={STATUS_META.delivered.dot} bg={STATUS_META.delivered.bg} />
          <StatCard label="Cancelled" value={stats.cancelled || 0} color={STATUS_META.cancelled.dot} bg={STATUS_META.cancelled.bg} />
        </div>

        {/* ── search + sort ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <Icon.Search />
            </span>
            <input
              type="text"
              placeholder="Search name, phone, order ID, city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: 34, paddingRight: search ? 32 : 12, paddingTop: 10, paddingBottom: 10,
                border: '1px solid #e5e7eb', borderRadius: 11, fontSize: '0.88rem', fontFamily: 'inherit',
                color: '#111827', background: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2,
              }}>
                <Icon.X />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 11,
              fontSize: '0.85rem', background: '#fff', color: '#374151',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <option value="newest">⬇ Newest first</option>
            <option value="oldest">⬆ Oldest first</option>
            <option value="highest">💰 Highest amount</option>
            <option value="lowest">💰 Lowest amount</option>
          </select>
        </div>

        {/* ── filter tabs ── */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {[
            { key: 'all', label: 'All', count: stats.all },
            ...ALL_STATUSES.map(s => ({ key: s, label: STATUS_META[s].label, count: stats[s] || 0, emoji: STATUS_META[s].emoji })),
          ].map(tab => (
            <button
              key={tab.key}
              className={`ao-filter-tab${filterStatus === tab.key ? ' active' : ''}`}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '7px 13px', borderRadius: 99, border: '1px solid #e5e7eb',
                background: filterStatus === tab.key ? '#0f766e' : '#fff',
                color: filterStatus === tab.key ? '#fff' : '#374151',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center',
              }}
            >
              {tab.emoji} {tab.label}
              <span style={{
                background: filterStatus === tab.key ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                color: filterStatus === tab.key ? '#fff' : '#6b7280',
                padding: '1px 6px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 800,
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── orders list ── */}
        {loading ? (
          /* skeleton */
          <div style={{ display: 'grid', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: '#f1f5f9', borderRadius: 18, height: 180,
                animation: 'pulse 1.5s ease infinite',
              }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: '#9ca3af', fontSize: '1rem', fontWeight: 600,
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📦</div>
            {search || filterStatus !== 'all' ? 'No orders match your filters.' : "No orders yet. They'll appear here once customers start ordering!"}
            {(search || filterStatus !== 'all') && (
              <button onClick={() => { setSearch(''); setFilter('all'); }} style={{
                display: 'block', margin: '14px auto 0', padding: '8px 20px',
                background: '#0f766e', color: '#fff', border: 'none', borderRadius: 10,
                fontWeight: 700, cursor: 'pointer',
              }}>Clear filters</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {displayed.map(o => (
              <OrderCard
                key={o._id}
                order={o}
                onStatusChange={updateStatus}
                updating={updatingId === o._id}
              />
            ))}
          </div>
        )}

        {/* ── results count ── */}
        {!loading && displayed.length > 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.78rem', marginTop: 20, fontWeight: 600 }}>
            Showing {displayed.length} of {orders.length} orders · Auto-refreshes every 45s
          </div>
        )}
      </div>
    </>
  );
}