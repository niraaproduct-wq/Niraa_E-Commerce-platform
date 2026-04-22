import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice.js';
import { API_BASE_URL } from '../../utils/constants.js';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [connectionStatus, setConnectionStatus] = useState('offline');
  const [metrics, setMetrics] = useState({
    totalRegisteredCustomers: 0,
    customersOrderedToday: 0,
    activeCustomers30Days: 0,
  });

  const normalizePhone = (phone) => String(phone || '').replace(/[^0-9]/g, '');
  const user = JSON.parse(localStorage.getItem('niraa_user') || 'null');
  const isAdmin = user?.role === 'admin';

  const loadCustomers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('niraa_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [ordersRes, registeredRes] = await Promise.all([
          fetch(`${API_BASE_URL}/orders`, { headers }),
          fetch(`${API_BASE_URL}/admin/customers?limit=5000`, { headers }),
        ]);

        if (!ordersRes.ok) {
          const e = await ordersRes.json().catch(() => ({}));
          throw new Error(e.message || 'Failed to load orders');
        }
        if (!registeredRes.ok) {
          const e = await registeredRes.json().catch(() => ({}));
          throw new Error(e.message || 'Failed to load registered customers');
        }

        const orderList = (await ordersRes.json()) || [];
        const registeredPayload = await registeredRes.json();
        const registeredCustomers = registeredPayload.customers || [];

        const map = {};

        for (const rc of registeredCustomers) {
          const key = normalizePhone(rc.phone) || rc._id || rc.id;
          if (!key) continue;
          map[key] = {
            id: rc._id || rc.id || key,
            name: rc.name || `${rc.firstName || ''} ${rc.lastName || ''}`.trim() || 'Customer',
            phone: rc.phone || '-',
            email: rc.email || '',
            registeredAt: rc.createdAt || null,
            ordersCount: 0,
            totalSpent: 0,
            lastOrderAt: null,
            orders: [],
          };
        }

        for (const o of orderList) {
          const key = normalizePhone(o.customerPhone);
          if (!key) continue;
          if (!map[key]) {
            map[key] = {
              id: key,
              name: o.customerName || 'Customer',
              phone: o.customerPhone || '-',
              email: '',
              registeredAt: null,
              ordersCount: 0,
              totalSpent: 0,
              lastOrderAt: null,
              orders: [],
            };
          }

          map[key].ordersCount += 1;
          map[key].totalSpent += Number(o.total || 0);
          map[key].lastOrderAt =
            !map[key].lastOrderAt || new Date(o.createdAt).getTime() > new Date(map[key].lastOrderAt).getTime()
              ? o.createdAt
              : map[key].lastOrderAt;
          map[key].orders.push(o);
        }

        const result = Object.values(map).sort(
          (a, b) => new Date(b.lastOrderAt || 0).getTime() - new Date(a.lastOrderAt || 0).getTime()
        );

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const orderedTodaySet = new Set();
        const active30Set = new Set();

        for (const o of orderList) {
          const phoneKey = normalizePhone(o.customerPhone);
          if (!phoneKey) continue;
          const createdAt = new Date(o.createdAt);
          if (createdAt >= todayStart) orderedTodaySet.add(phoneKey);
          if (createdAt >= thirtyDaysAgo) active30Set.add(phoneKey);
        }

        setMetrics({
          totalRegisteredCustomers: registeredCustomers.length,
          customersOrderedToday: orderedTodaySet.size,
          activeCustomers30Days: active30Set.size,
        });
        setCustomers(result);
      } catch (err) {
        toast.error(err.message || 'Failed to load customers');
        setMetrics({
          totalRegisteredCustomers: 0,
          customersOrderedToday: 0,
          activeCustomers30Days: 0,
        });
        setCustomers([]);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadCustomers();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = API_BASE_URL.replace(/^https?:\/\//, '').replace(/\/api$/, '');
    const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws`);

    ws.onopen = () => setConnectionStatus('online');
    ws.onclose = () => setConnectionStatus('offline');
    ws.onerror = () => setConnectionStatus('offline');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.event === 'orders.changed' || data?.event === 'customers.changed') {
          loadCustomers();
        }
      } catch (err) {
        // ignore invalid event payload
      }
    };

    return () => ws.close();
  }, [isAdmin]);

  const statusMeta = useMemo(
    () => ({
      placed: { label: 'Placed', bg: '#e6f4f2', fg: 'var(--teal-dark)', border: 'rgba(42,125,114,0.25)' },
      confirmed: { label: 'Confirmed', bg: '#fff5e3', fg: '#996a10', border: 'rgba(200,168,75,0.35)' },
      'out-for-delivery': { label: 'Out for delivery', bg: '#eff6ff', fg: '#1d4ed8', border: 'rgba(29,78,216,0.25)' },
      delivered: { label: 'Delivered', bg: '#f0fff4', fg: 'var(--green)', border: 'rgba(56,161,105,0.25)' },
      cancelled: { label: 'Cancelled', bg: '#fff5f5', fg: 'var(--red)', border: 'rgba(229,62,62,0.25)' },
    }),
    []
  );

  const formatDate = (iso) => {
    try {
      if (!iso) return '-';
      return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return '-';
    }
  };

  const filteredCustomers = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return customers
      .filter((c) => {
        const q = searchText.trim().toLowerCase();
        if (!q) return true;
        return (
          String(c.name || '').toLowerCase().includes(q) ||
          String(c.phone || '').toLowerCase().includes(q) ||
          String(c.email || '').toLowerCase().includes(q)
        );
      })
      .filter((c) => {
        if (activityFilter === 'all') return true;
        if (!c.lastOrderAt) return activityFilter === 'no-orders';
        const lastOrder = new Date(c.lastOrderAt);
        if (activityFilter === 'today') return lastOrder >= todayStart;
        if (activityFilter === '7d') return lastOrder >= sevenDaysAgo;
        if (activityFilter === '30d') return lastOrder >= thirtyDaysAgo;
        return true;
      });
  }, [customers, searchText, activityFilter]);

  const exportToCsv = () => {
    const headers = ['Name', 'Phone', 'Email', 'Registered At', 'Orders', 'Total Spent', 'Last Order'];
    const rows = filteredCustomers.map((c) => [
      c.name || '',
      c.phone || '',
      c.email || '',
      c.registeredAt ? new Date(c.registeredAt).toISOString() : '',
      c.ordersCount || 0,
      Number(c.totalSpent || 0).toFixed(2),
      c.lastOrderAt ? new Date(c.lastOrderAt).toISOString() : '',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `niraa-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-customers container" style={{ padding: 18 }}>
      {!isAdmin && (
        <div style={{ marginBottom: 12, color: '#9f1239', background: '#fff1f2', border: '1px solid #fecdd3', padding: 10, borderRadius: 10, fontWeight: 700 }}>
          Admin access required. Please login with an admin account.
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--teal-dark)' }}>Customers</h2>
          <div style={{ marginTop: 6, color: 'var(--gray-600)', fontWeight: 700 }}>
            {loading ? 'Loading...' : `${customers.length} customer(s)`}
          </div>
        </div>
        <div style={{ color: 'var(--gray-600)', fontWeight: 700 }}>Order history is expandable</div>
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: '0.82rem',
            background: connectionStatus === 'online' ? '#e6f9ee' : '#fff1f2',
            color: connectionStatus === 'online' ? '#166534' : '#9f1239',
            border: `1px solid ${connectionStatus === 'online' ? '#bbf7d0' : '#fecdd3'}`,
          }}
        >
          Realtime: {connectionStatus}
        </div>
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by name, phone, email"
          style={{
            border: '1px solid var(--gray-300)',
            borderRadius: 10,
            padding: '9px 12px',
            minWidth: 240,
          }}
        />
        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          style={{
            border: '1px solid var(--gray-300)',
            borderRadius: 10,
            padding: '9px 12px',
            background: '#fff',
          }}
        >
          <option value="all">All customers</option>
          <option value="today">Ordered today</option>
          <option value="7d">Active last 7 days</option>
          <option value="30d">Active last 30 days</option>
          <option value="no-orders">No orders yet</option>
        </select>
        <button
          type="button"
          onClick={exportToCsv}
          style={{
            border: 'none',
            borderRadius: 10,
            padding: '9px 14px',
            background: 'var(--teal)',
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Export CSV
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10,
        }}
      >
        {[
          { label: 'Total Registered Customers', value: metrics.totalRegisteredCustomers },
          { label: 'Customers Ordered Today', value: metrics.customersOrderedToday },
          { label: 'Active Customers (last 30 days)', value: metrics.activeCustomers30Days },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: '#fff',
              border: '1px solid var(--gray-200)',
              borderRadius: 14,
              padding: '12px 14px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ color: 'var(--gray-500)', fontWeight: 700, fontSize: '0.85rem' }}>{m.label}</div>
            <div style={{ marginTop: 6, color: 'var(--teal-dark)', fontWeight: 900, fontSize: '1.4rem' }}>
              {loading ? '...' : m.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        {filteredCustomers.map(c => (
          <div
            key={c.phone}
            style={{
              padding: 14,
              background: '#fff',
              marginBottom: 12,
              borderRadius: 16,
              border: '1px solid var(--gray-200)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: 'var(--teal-dark)', fontSize: '1.05rem' }}>{c.name}</div>
                <div style={{ marginTop: 6, color: 'var(--gray-600)', fontWeight: 800 }}>{c.phone}</div>
                {c.email && <div style={{ marginTop: 4, color: 'var(--gray-500)', fontSize: '0.9rem' }}>{c.email}</div>}
                <div style={{ marginTop: 6, color: 'var(--gray-600)' }}>
                  Orders: <strong style={{ color: 'var(--gray-800)' }}>{c.ordersCount}</strong> • Total spent:{' '}
                  <strong style={{ color: 'var(--gray-800)' }}>{formatPrice(c.totalSpent)}</strong>
                </div>
                <div style={{ marginTop: 6, color: 'var(--gray-600)', fontSize: '0.92rem' }}>
                  Registered:{' '}
                  <strong style={{ color: 'var(--gray-800)' }}>{formatDate(c.registeredAt)}</strong>
                </div>
                <div style={{ marginTop: 6, color: 'var(--gray-600)', fontSize: '0.92rem' }}>
                  Last order:{' '}
                  <strong style={{ color: 'var(--gray-800)' }}>{formatDate(c.lastOrderAt)}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10, justifyItems: 'end' }}>
                <a
                  href={`https://wa.me/${normalizePhone(c.phone)}?text=${encodeURIComponent(
                    `Hello ${c.name || ''}, thanks for ordering NIRAA! How can we help you today?`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#25D366',
                    color: '#fff',
                    padding: '10px 12px',
                    borderRadius: 14,
                    fontWeight: 900,
                    textDecoration: 'none',
                    width: 'fit-content',
                  }}
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 900, color: 'var(--teal-dark)' }}>
                Order history ({c.orders.length})
              </summary>
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                {c.orders
                  .slice()
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(o => (
                    <div
                      key={o._id}
                      style={{
                        background: 'var(--cream)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: 14,
                        padding: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, color: 'var(--gray-800)' }}>#{o._id}</div>
                        <div style={{ marginTop: 4, color: 'var(--gray-600)', fontWeight: 800, fontSize: '0.92rem' }}>
                          {formatDate(o.createdAt)} • {o.items?.length || 0} item(s)
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <span
                            style={{
                              background: statusMeta[o.status]?.bg || '#f3f4f6',
                              color: statusMeta[o.status]?.fg || 'var(--gray-600)',
                              border: `1px solid ${statusMeta[o.status]?.border || 'rgba(0,0,0,0.08)'}`,
                              borderRadius: 9999,
                              padding: '5px 10px',
                              fontWeight: 900,
                              fontSize: '0.8rem',
                              textTransform: 'capitalize',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {statusMeta[o.status]?.label || o.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 900, color: 'var(--teal-dark)', whiteSpace: 'nowrap' }}>
                        {formatPrice(o.total || 0)}
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          </div>
        ))}
        {filteredCustomers.length === 0 && !loading && <div>No customers found for selected filters</div>}
      </div>
    </div>
  );
}
