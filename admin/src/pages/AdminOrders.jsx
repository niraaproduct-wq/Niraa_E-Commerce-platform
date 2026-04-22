import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice.js';
import { API_BASE_URL } from '../utils/constants.js';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const getToken = () => localStorage.getItem('niraa_token');
  const user = JSON.parse(localStorage.getItem('niraa_user') || 'null');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/orders`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load orders');
        setOrders(data || []);
      } catch (err) { setOrders([]); }
    })();
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

  const statuses = useMemo(
    () => ['placed', 'confirmed', 'out-for-delivery', 'delivered', 'cancelled'],
    []
  );

  const normalizePhone = (phone) => String(phone || '').replace(/[^0-9]/g, '');

  const updateStatus = async (id, status) => {
    try {
      const token = getToken();
      setUpdatingId(id);
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || 'Update failed');
      setOrders(list => list.map(o => o._id === updated._id ? updated : o));
      toast.success('Order status updated');
    } catch (err) { toast.error(err.message || 'Error'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="admin-orders container" style={{ padding: 18 }}>
      {!isAdmin && (
        <div style={{ marginBottom: 12, color: '#9f1239', background: '#fff1f2', border: '1px solid #fecdd3', padding: 10, borderRadius: 10, fontWeight: 700 }}>
          Admin access required. Please login with an admin account.
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--teal-dark)' }}>Orders</h2>
          <div style={{ marginTop: 6, color: 'var(--gray-600)', fontWeight: 700 }}>{orders.length} order(s)</div>
        </div>
        <div style={{ color: 'var(--gray-600)', fontWeight: 700 }}>Tap status pills to update</div>
      </div>

      <div style={{ marginTop: 14 }}>
        {orders.map(o => (
          <div
            key={o._id}
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
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 900, color: 'var(--teal-dark)', fontSize: '1.02rem' }}>Order #{o._id}</div>
                  <div
                    style={{
                      background: statusMeta[o.status]?.bg || '#f3f4f6',
                      color: statusMeta[o.status]?.fg || 'var(--gray-600)',
                      border: `1px solid ${statusMeta[o.status]?.border || 'rgba(0,0,0,0.08)'}`,
                      borderRadius: 9999,
                      padding: '6px 10px',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      textTransform: 'capitalize',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {statusMeta[o.status]?.label || o.status}
                  </div>
                </div>

                <div style={{ marginTop: 6, color: 'var(--gray-600)', fontWeight: 800 }}>
                  {o.customerName} • {o.customerPhone}
                </div>

                <div style={{ marginTop: 6, color: 'var(--gray-600)' }}>
                  {o.items?.length || 0} item(s) • Total {formatPrice(o.total)}
                </div>

                <div style={{ marginTop: 6, color: 'var(--gray-600)', fontSize: '0.92rem', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--gray-800)' }}>Address:</strong> {o.address?.street || '-'}, {o.address?.city || '-'} - {o.address?.pincode || '-'}
                </div>

                <div style={{ marginTop: 6, color: 'var(--gray-600)', fontSize: '0.92rem' }}>
                  <strong style={{ color: 'var(--gray-800)' }}>Payment:</strong> {o.paymentMethod?.toUpperCase?.() || o.paymentMethod} • {o.paymentStatus || 'pending'}
                  {o.viaWhatsApp ? ' • via WhatsApp' : ''}
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10, justifyItems: 'end' }}>
                <a
                  href={`https://wa.me/${normalizePhone(o.customerPhone)}?text=${encodeURIComponent(
                    `Hello ${o.customerName || ''}, regarding your NIRAA order #${o._id}.\nCurrent status: ${o.status}.\nTotal: ${formatPrice(o.total)}.`
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
                  WhatsApp customer
                </a>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900, color: 'var(--teal-dark)', marginBottom: 8 }}>Update status</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {statuses.map(s => {
                  const meta = statusMeta[s];
                  const active = o.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={updatingId === o._id}
                      onClick={() => updateStatus(o._id, s)}
                      style={{
                        background: active ? meta?.bg : 'var(--gray-100)',
                        color: active ? meta?.fg : 'var(--gray-600)',
                        border: `1px solid ${active ? meta?.border : 'var(--gray-200)'}`,
                        borderRadius: 9999,
                        padding: '8px 10px',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        cursor: updatingId === o._id ? 'not-allowed' : 'pointer',
                        transition: 'var(--transition)',
                      }}
                    >
                      {meta?.label || s}
                    </button>
                  );
                })}
              </div>
            </div>

            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 900, color: 'var(--teal-dark)' }}>
                View items ({o.items?.length || 0})
              </summary>
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                {(o.items || []).map((it, idx) => (
                  <div
                    key={`${it.product || it._id || idx}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      background: 'var(--cream)',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 14,
                      padding: 10,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, color: 'var(--gray-800)' }}>{it.name || it.product?.name || 'Product'}</div>
                      <div style={{ color: 'var(--gray-600)', fontWeight: 800, marginTop: 2 }}>
                        Qty: {it.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 900, color: 'var(--teal-dark)', whiteSpace: 'nowrap' }}>
                      {formatPrice(Number(it.price || 0) * Number(it.quantity || 0))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        ))}
        {orders.length === 0 && <div>No orders</div>}
      </div>
    </div>
  );
}
