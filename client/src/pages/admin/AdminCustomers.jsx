import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice.js';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // derive customers from orders endpoint
    (async () => {
      try {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem('niraa_user') || 'null')?.token;
        const res = await fetch('http://localhost:5000/api/orders', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        const list = data || [];

        const map = {};
        for (const o of list) {
          const key = o.customerPhone;
          if (!map[key]) {
            map[key] = {
              name: o.customerName,
              phone: o.customerPhone,
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
        setCustomers(result);
      } catch (err) {
        toast.error(err.message || 'Failed to load customers');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  const normalizePhone = (phone) => String(phone || '').replace(/[^0-9]/g, '');

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return '-';
    }
  };

  return (
    <div className="admin-customers container" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--teal-dark)' }}>Customers</h2>
          <div style={{ marginTop: 6, color: 'var(--gray-600)', fontWeight: 700 }}>
            {loading ? 'Loading...' : `${customers.length} customer(s)`}
          </div>
        </div>
        <div style={{ color: 'var(--gray-600)', fontWeight: 700 }}>Order history is expandable</div>
      </div>

      <div style={{ marginTop: 14 }}>
        {customers.map(c => (
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
                <div style={{ marginTop: 6, color: 'var(--gray-600)' }}>
                  Orders: <strong style={{ color: 'var(--gray-800)' }}>{c.ordersCount}</strong> • Total spent:{' '}
                  <strong style={{ color: 'var(--gray-800)' }}>{formatPrice(c.totalSpent)}</strong>
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
        {customers.length === 0 && !loading && <div>No customers yet</div>}
      </div>
    </div>
  );
}
