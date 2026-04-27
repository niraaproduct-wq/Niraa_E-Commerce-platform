import React, { useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice.js';
import { API_BASE_URL } from '../utils/constants.js';

// ── Tiny inline SVG icon system ───────────────────────────────────────────────
const IC = ({ d, size = 16, stroke = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  search: 'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  export: 'M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V3M8 7l4-4 4 4',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
  whatsapp: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
  chevronD: 'M6 9l6 6 6-6',
  chevronU: 'M18 15l-6-6-6 6',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
  phone: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
  calendar: 'M3 9h18M3 4h18v17H3zM8 2v4M16 2v4',
  bag: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  dots: 'M12 5h.01M12 12h.01M12 19h.01',
  copy: 'M8 4H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1v-3M8 4a1 1 0 011-1h7l4 4v10a1 1 0 01-1 1H9a1 1 0 01-1-1V4z',
  x: 'M18 6L6 18M6 6l12 12',
  sort: 'M3 6h18M7 12h10M11 18h2',
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent, loading }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #eaedf2',
    borderRadius: 16,
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
  >
    <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>
      <IC d={icons[icon]} size={20} />
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>
        {loading ? <span style={{ opacity: 0.3 }}>—</span> : value.toLocaleString()}
      </div>
    </div>
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_META = {
  placed: { label: 'Placed', bg: '#eff6ff', fg: '#1d4ed8' },
  confirmed: { label: 'Confirmed', bg: '#fefce8', fg: '#a16207' },
  'out-for-delivery': { label: 'Out for Delivery', bg: '#f0f9ff', fg: '#0369a1' },
  delivered: { label: 'Delivered', bg: '#f0fdf4', fg: '#16a34a' },
  cancelled: { label: 'Cancelled', bg: '#fff1f2', fg: '#be123c' },
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { label: status, bg: '#f3f4f6', fg: '#6b7280' };
  return (
    <span style={{ background: m.bg, color: m.fg, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, textTransform: 'capitalize', letterSpacing: '0.03em', display: 'inline-block' }}>{m.label}</span>
  );
};

// ── Customer avatar ───────────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colors = ['#2d9a8e', '#7c3aed', '#be123c', '#b45309', '#0369a1', '#166534'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, fontFamily: "'DM Mono', monospace", flexShrink: 0, border: `1.5px solid ${color}30` }}>
      {initials}
    </div>
  );
};

// ── Activity chip ─────────────────────────────────────────────────────────────
const ActivityChip = ({ lastOrderAt }) => {
  if (!lastOrderAt) return <span style={{ fontSize: 10, fontWeight: 700, background: '#f3f4f6', color: '#94a3b8', padding: '2px 8px', borderRadius: 99 }}>No orders</span>;
  const days = Math.floor((Date.now() - new Date(lastOrderAt)) / 86400000);
  const [bg, fg, label] =
    days === 0 ? ['#d1fae5', '#065f46', 'Today'] :
      days <= 7 ? ['#dbeafe', '#1e40af', `${days}d ago`] :
        days <= 30 ? ['#fef3c7', '#92400e', `${days}d ago`] :
          ['#fee2e2', '#991b1b', `${days}d ago`];
  return <span style={{ fontSize: 10, fontWeight: 700, background: bg, color: fg, padding: '2px 8px', borderRadius: 99 }}>{label}</span>;
};

// ── Customer row (expandable) ─────────────────────────────────────────────────
const CustomerRow = ({ c, normalizePhone }) => {
  const [open, setOpen] = useState(false);
  const waLink = `https://wa.me/${normalizePhone(c.phone)}?text=${encodeURIComponent(`Hello ${c.name || ''}, thanks for ordering! How can we help you today?`)}`;

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #eaedf2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s' }}>
      {/* ── Main row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 14, padding: '14px 16px', alignItems: 'center' }}>
        <Avatar name={c.name} />

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{c.name}</span>
            <ActivityChip lastOrderAt={c.lastOrderAt} />
          </div>

          <div style={{ marginTop: 5, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
              <IC d={icons.phone} size={12} />{c.phone || '—'}
            </span>
            {c.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                <IC d={icons.mail} size={12} />{c.email}
              </span>
            )}
          </div>

          <div style={{ marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
              <IC d={icons.bag} size={12} />
              <strong style={{ color: '#0f172a' }}>{c.ordersCount}</strong> order{c.ordersCount !== 1 ? 's' : ''}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
              <IC d={icons.tag} size={12} />
              <strong style={{ color: '#2d9a8e' }}>{formatPrice(c.totalSpent)}</strong> spent
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8' }}>
              <IC d={icons.calendar} size={12} />
              Reg. {formatDate(c.registeredAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <a href={waLink} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <IC d={icons.whatsapp} size={13} />WhatsApp
          </a>
          {c.ordersCount > 0 && (
            <button onClick={() => setOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 10px', fontSize: 11, fontWeight: 700, color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {open ? <IC d={icons.chevronU} size={12} /> : <IC d={icons.chevronD} size={12} />}
              {c.ordersCount} order{c.ordersCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded order history ── */}
      {open && c.orders.length > 0 && (
        <div style={{ borderTop: '1px solid #f1f5f9', background: '#f8fafc', padding: '12px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Order History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {c.orders
              .slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(o => (
                <div key={o._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #eaedf2', borderRadius: 10, padding: '10px 12px', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#94a3b8' }}>#{String(o._id).slice(-8)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>
                      {formatDate(o.createdAt)} · {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    {o.items && o.items.length > 0 && (
                      <div style={{ marginTop: 4, fontSize: 11, color: '#94a3b8' }}>
                        {o.items.slice(0, 3).map(it => it.name || it.productName || 'Item').join(', ')}
                        {o.items.length > 3 ? ` +${o.items.length - 3} more` : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: 14, color: '#2d9a8e', whiteSpace: 'nowrap' }}>
                    {formatPrice(o.total || 0)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastOrder');
  const [connectionStatus, setConnectionStatus] = useState('offline');
  const [metrics, setMetrics] = useState({ totalRegisteredCustomers: 0, customersOrderedToday: 0, activeCustomers30Days: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const normalizePhone = (phone) => String(phone || '').replace(/[^0-9]/g, '');
  const user = JSON.parse(localStorage.getItem('niraa_user') || 'null');
  const isAdmin = user?.role === 'admin';

  const loadCustomers = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      else setRefreshing(true);
      const token = localStorage.getItem('niraa_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [ordersRes, registeredRes] = await Promise.all([
        fetch(`${API_BASE_URL}/orders`, { headers }),
        fetch(`${API_BASE_URL}/admin/customers?limit=5000`, { headers }),
      ]);

      if (!ordersRes.ok || !registeredRes.ok) throw new Error('Failed to load data');

      const orderList = (await ordersRes.json()) || [];
      const registeredPayload = await registeredRes.json();
      const registeredCustomers = registeredPayload.customers || [];

      const map = {};
      for (const rc of registeredCustomers) {
        const key = normalizePhone(rc.phone) || rc._id || rc.id;
        if (!key) continue;
        map[key] = { id: rc._id || rc.id || key, name: rc.name || `${rc.firstName || ''} ${rc.lastName || ''}`.trim() || 'Customer', phone: rc.phone || '-', email: rc.email || '', registeredAt: rc.createdAt || null, ordersCount: 0, totalSpent: 0, lastOrderAt: null, orders: [] };
      }

      for (const o of orderList) {
        const key = normalizePhone(o.customerPhone);
        if (!key) continue;
        if (!map[key]) map[key] = { id: key, name: o.customerName || 'Customer', phone: o.customerPhone || '-', email: '', registeredAt: null, ordersCount: 0, totalSpent: 0, lastOrderAt: null, orders: [] };
        map[key].ordersCount += 1;
        map[key].totalSpent += Number(o.total || 0);
        map[key].lastOrderAt = !map[key].lastOrderAt || new Date(o.createdAt) > new Date(map[key].lastOrderAt) ? o.createdAt : map[key].lastOrderAt;
        map[key].orders.push(o);
      }

      const result = Object.values(map);
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const orderedTodaySet = new Set();
      const active30Set = new Set();
      for (const o of orderList) {
        const key = normalizePhone(o.customerPhone);
        if (!key) continue;
        const d = new Date(o.createdAt);
        if (d >= todayStart) orderedTodaySet.add(key);
        if (d >= thirtyDaysAgo) active30Set.add(key);
      }

      setMetrics({ totalRegisteredCustomers: registeredCustomers.length, customersOrderedToday: orderedTodaySet.size, activeCustomers30Days: active30Set.size });
      setCustomers(result);
    } catch (err) {
      toast.error(err.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) loadCustomers(); }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    let wsHost = window.location.hostname === 'localhost' ? 'localhost:5000' : window.location.host;
    if (API_BASE_URL.startsWith('http')) wsHost = API_BASE_URL.replace(/^https?:\/\//, '').replace(/\/api$/, '');
    const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws`);
    ws.onopen = () => setConnectionStatus('online');
    ws.onclose = () => setConnectionStatus('offline');
    ws.onerror = () => setConnectionStatus('offline');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.event === 'orders.changed' || data?.event === 'customers.changed') loadCustomers(true);
      } catch { }
    };
    return () => ws.close();
  }, [isAdmin]);

  const filteredCustomers = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return customers
      .filter(c => {
        const q = searchText.trim().toLowerCase();
        if (!q) return true;
        return [c.name, c.phone, c.email].some(f => String(f || '').toLowerCase().includes(q));
      })
      .filter(c => {
        if (activityFilter === 'all') return true;
        if (!c.lastOrderAt) return activityFilter === 'no-orders';
        const last = new Date(c.lastOrderAt);
        if (activityFilter === 'today') return last >= todayStart;
        if (activityFilter === '7d') return last >= sevenDaysAgo;
        if (activityFilter === '30d') return last >= thirtyDaysAgo;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'lastOrder') return new Date(b.lastOrderAt || 0) - new Date(a.lastOrderAt || 0);
        if (sortBy === 'totalSpent') return b.totalSpent - a.totalSpent;
        if (sortBy === 'orders') return b.ordersCount - a.ordersCount;
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [customers, searchText, activityFilter, sortBy]);

  const exportToCsv = () => {
    const headers = ['Name', 'Phone', 'Email', 'Registered At', 'Orders', 'Total Spent (₹)', 'Last Order'];
    const rows = filteredCustomers.map(c => [
      c.name || '', c.phone || '', c.email || '',
      c.registeredAt ? new Date(c.registeredAt).toISOString() : '',
      c.ordersCount || 0,
      Number(c.totalSpent || 0).toFixed(2),
      c.lastOrderAt ? new Date(c.lastOrderAt).toISOString() : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `customers-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
  };

  const totalRevenue = useMemo(() => customers.reduce((s, c) => s + c.totalSpent, 0), [customers]);

  if (!isAdmin) return (
    <div style={{ margin: 24, padding: 20, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, color: '#9f1239', fontWeight: 700 }}>
      Admin access required.
    </div>
  );

  return (
    <div style={{ padding: '24px 20px', maxWidth: 960, margin: '0 auto', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap');
        .cust-row { transition: box-shadow 0.15s; }
        .cust-row:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07) !important; }
        .filter-btn { transition: background 0.12s, color 0.12s; }
        .filter-btn:hover { background: #f1f5f9 !important; }
        .filter-btn.active { background: #0f172a !important; color: #fff !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Customers</h1>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {loading ? 'Loading…' : `${customers.length.toLocaleString()} total`}
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }} />
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
              color: connectionStatus === 'online' ? '#16a34a' : '#94a3b8',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: connectionStatus === 'online' ? '#22c55e' : '#e2e8f0', display: 'inline-block', boxShadow: connectionStatus === 'online' ? '0 0 0 3px #dcfce7' : 'none' }} />
              {connectionStatus === 'online' ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => loadCustomers(true)} disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>
              <IC d={icons.refresh} size={14} />
            </span>
            Refresh
          </button>
          <button onClick={exportToCsv}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#0f172a', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
            <IC d={icons.export} size={14} />Export CSV
          </button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Customers" value={metrics.totalRegisteredCustomers} icon="user" accent="#2d9a8e" loading={loading} />
        <StatCard label="Ordered Today" value={metrics.customersOrderedToday} icon="bag" accent="#7c3aed" loading={loading} />
        <StatCard label="Active (30 days)" value={metrics.activeCustomers30Days} icon="star" accent="#d97706" loading={loading} />
        <StatCard label="Total Revenue" value={totalRevenue} icon="tag" accent="#be123c" loading={loading} />
      </div>

      {/* ── Filters bar ── */}
      <div style={{ background: '#fff', border: '1px solid #eaedf2', borderRadius: 14, padding: '12px 14px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}><IC d={icons.search} size={14} /></span>
          <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Name, phone or email…"
            style={{ width: '100%', padding: '8px 10px 8px 32px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* Activity filter pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {[
            { val: 'all', label: 'All' },
            { val: 'today', label: 'Today' },
            { val: '7d', label: '7 days' },
            { val: '30d', label: '30 days' },
            { val: 'no-orders', label: 'No orders' },
          ].map(f => (
            <button key={f.val} onClick={() => setActivityFilter(f.val)}
              className={`filter-btn${activityFilter === f.val ? ' active' : ''}`}
              style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: activityFilter === f.val ? '#fff' : '#475569', background: activityFilter === f.val ? '#0f172a' : '#fff' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <IC d={icons.sort} size={13} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 8px', fontSize: 12, color: '#475569', background: '#fff', cursor: 'pointer', outline: 'none' }}>
            <option value="lastOrder">Last order</option>
            <option value="totalSpent">Highest spend</option>
            <option value="orders">Most orders</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, fontWeight: 500 }}>
          Showing {filteredCustomers.length.toLocaleString()} of {customers.length.toLocaleString()} customers
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ height: 80, background: '#f8fafc', border: '1px solid #eaedf2', borderRadius: 16, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.08}s` }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } @keyframes spin { to{transform:rotate(360deg)} }`}</style>
        </div>
      )}

      {/* ── Customer list ── */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredCustomers.map(c => (
            <div key={c.id} className="cust-row">
              <CustomerRow c={c} normalizePhone={normalizePhone} />
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <div style={{ fontWeight: 700, color: '#64748b', fontSize: 15 }}>No customers found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search or filters</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}