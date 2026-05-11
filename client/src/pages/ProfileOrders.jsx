import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../utils/constants.js';
import Loader from '../components/Loader.jsx';

import { FiPackage, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';

const STATUS_CONFIG = {
  placed: { color: '#0f766e', bg: '#f0fdf9', label: 'Placed', icon: '🛎️', step: 0 },
  confirmed: { color: '#b45309', bg: '#fffbeb', label: 'Confirmed', icon: '✅', step: 1 },
  packed: { color: '#6d28d9', bg: '#f5f3ff', label: 'Packed', icon: '📦', step: 2 },
  shipped: { color: '#0369a1', bg: '#f0f9ff', label: 'Shipped', icon: '🚢', step: 3 },
  'out_for_delivery': { color: '#1d4ed8', bg: '#eff6ff', label: 'Delivery', icon: '🚚', step: 4 },
  delivered: { color: '#15803d', bg: '#f0fdf4', label: 'Delivered', icon: '🎉', step: 5 },
  cancelled: { color: '#dc2626', bg: '#fef2f2', label: 'Cancelled', icon: '❌', step: -1 },
};

const ORDER_STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

function CancellationModal({ order, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [otherText, setOtherText] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = [
    { key: 'changed_mind', label: 'Changed my mind' },
    { key: 'wrong_item', label: 'Ordered the wrong item' },
    { key: 'better_price', label: 'Found a better price elsewhere' },
    { key: 'too_long', label: 'Delivery time is too long' },
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
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      padding: 20, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420,
        overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{ padding: '24px 24px 16px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 900, color: 'var(--gray-900)' }}>
            Why are you cancelling?
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>
            Order #{shortId} • {itemCount} items • ₹{order.total ?? order.totalAmount}
          </div>
        </div>

        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reasons.map((r) => (
            <label key={r.key} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderRadius: 14, border: `2.5px solid ${reason === r.key ? 'var(--teal)' : '#f3f4f6'}`,
              background: reason === r.key ? 'rgba(42,125,114,0.04)' : '#f9fafb',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <input
                type="radio"
                name="cancelReason"
                checked={reason === r.key}
                onChange={() => setReason(r.key)}
                style={{ accentColor: 'var(--teal)', width: 18, height: 18 }}
              />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: reason === r.key ? 'var(--teal-dark)' : 'var(--gray-700)' }}>
                {r.label}
              </span>
            </label>
          ))}

          {reason === 'other' && (
            <div style={{ marginTop: 4, animation: 'fadeIn 0.3s' }}>
              <textarea
                placeholder="Please tell us more (min 5 characters)..."
                value={otherText}
                onChange={(e) => setOtherText(e.target.value.slice(0, 200))}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: '1.5px solid #e5e7eb',
                  background: '#fff', fontSize: '0.88rem', minHeight: 80, resize: 'none',
                  outline: 'none', focus: 'border-color: var(--teal)',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 600 }}>
                <span>{otherText.length < 5 && otherText.length > 0 ? `Need ${5 - otherText.length} more chars` : ''}</span>
                <span>{otherText.length}/200</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', background: '#f9fafb', display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '14px', borderRadius: 16, border: '1px solid #e5e7eb',
              background: '#fff', color: 'var(--gray-600)', fontWeight: 800, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Keep order
          </button>
          <button
            disabled={!isValid || loading}
            onClick={handleConfirm}
            style={{
              flex: 1.5, padding: '14px', borderRadius: 16, border: 'none',
              background: !isValid || loading ? '#e5e7eb' : '#dc2626',
              color: '#fff', fontWeight: 800, fontSize: '0.9rem',
              cursor: !isValid || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: !isValid || loading ? 'none' : '0 8px 20px rgba(220,38,38,0.25)',
            }}
          >
            {loading ? 'Cancelling...' : 'Confirm cancel'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

function OrderCard({ order, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;

  const currentStep = cfg.step;
  const isCancelled = order.status === 'cancelled';

  return (
    <div style={{
      background: '#fff',
      borderRadius: 22,
      border: '1px solid rgba(42,125,114,0.1)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(42,125,114,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'}
    >
      {/* Card Header */}
      <div style={{ padding: '18px 20px', background: `linear-gradient(135deg, ${cfg.bg}, #fff)`, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 700, fontFamily: 'monospace' }}>
                #{order._id?.slice(-8).toUpperCase()}
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: 999, fontSize: '0.73rem', fontWeight: 800,
                background: cfg.bg, color: cfg.color,
                border: `1px solid ${cfg.color}30`,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 500 }}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--teal-dark)', letterSpacing: '-0.02em' }}>
              ₹{order.total ?? order.totalAmount ?? 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600 }}>
              {order.items?.reduce((sum, i) => sum + i.quantity, 0)} items
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {ORDER_STEPS.map((step, idx) => {
              const stepCfg = STATUS_CONFIG[step];
              const isCompleted = currentStep > stepCfg.step;
              const isCurrent = currentStep === stepCfg.step;
              const isLast = idx === ORDER_STEPS.length - 1;

              return (
                <React.Fragment key={step}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: isLast ? 0 : undefined, flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isCompleted ? 'var(--teal)' : isCurrent ? cfg.bg : '#f3f4f6',
                      border: `2px solid ${isCompleted || isCurrent ? (isCompleted ? 'var(--teal)' : cfg.color) : '#e5e7eb'}`,
                      fontSize: '0.7rem',
                      transition: 'all 0.3s',
                      boxShadow: isCurrent ? `0 0 0 4px ${cfg.color}20` : 'none',
                    }}>
                      {isCompleted ? '✓' : <span style={{ fontSize: '0.8rem' }}>{stepCfg.icon}</span>}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: isCompleted || isCurrent ? 'var(--gray-700)' : 'var(--gray-400)', fontWeight: isCurrent ? 800 : 500, marginTop: 4, whiteSpace: 'nowrap', textAlign: 'center', maxWidth: 56, lineHeight: 1.2 }}>
                      {stepCfg.label}
                    </div>
                  </div>
                  {!isLast && (
                    <div style={{
                      flex: 1, height: 2, marginTop: -14,
                      background: isCompleted ? 'var(--teal)' : '#e5e7eb',
                      transition: 'background 0.4s',
                      minWidth: 12,
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Preview */}
      <div style={{ padding: '14px 20px' }}>
        {order.items?.slice(0, expanded ? order.items.length : 2).map((item, idx) => {
          const itemImage = item.image || item.images?.[0] || null;

          return (
            <div key={idx} style={{
              display: 'flex', gap: 12, alignItems: 'center',
              padding: '10px 0',
              borderBottom: idx < (expanded ? order.items.length - 1 : Math.min(2, order.items.length) - 1) ? '1px solid rgba(0,0,0,0.04)' : 'none',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: 'linear-gradient(135deg, #f0faf8, #f8fffe)',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, border: '1px solid rgba(42,125,114,0.08)',
              }}>
                {itemImage ? (
                  <img src={itemImage} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.6rem' }}>🧴</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--gray-800)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.77rem', color: 'var(--gray-500)' }}>
                  {item.quantity} × ₹{item.price}
                </div>
              </div>
              <div style={{ fontWeight: 800, color: 'var(--gray-800)', fontSize: '0.92rem', flexShrink: 0 }}>
                ₹{item.price * item.quantity}
              </div>
            </div>
          );
        })}

        {/* Expand / Collapse */}
        {order.items?.length > 2 && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              width: '100%', padding: '10px 0', marginTop: 4,
              background: 'rgba(42,125,114,0.05)', borderRadius: 12,
              border: '1px dashed rgba(42,125,114,0.2)',
              color: 'var(--teal)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(42,125,114,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(42,125,114,0.05)'}
          >
            {expanded ? <><FiChevronUp size={14} /> Show less</> : <><FiChevronDown size={14} /> +{order.items.length - 2} more items</>}
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '14px 20px', background: '#fafafa',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {order.paymentMethod && (
            <span style={{ fontSize: '0.73rem', color: 'var(--gray-500)', fontWeight: 600, background: '#f3f4f6', padding: '3px 10px', borderRadius: 999 }}>
              💳 {order.paymentMethod}
            </span>
          )}
          {order.address?.city && (
            <span style={{ fontSize: '0.73rem', color: 'var(--gray-500)', fontWeight: 600, background: '#f3f4f6', padding: '3px 10px', borderRadius: 999 }}>
              📍 {order.address.city}
            </span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem', color: 'var(--teal-dark)' }}>
          Total: ₹{order.total ?? order.totalAmount ?? 0}
        </div>
      </div>

      {/* Cancellation Section */}
      {!isCancelled && order.status !== 'delivered' && (
        <div style={{
          padding: '12px 20px',
          background: '#fff',
          borderTop: '1px solid rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          {['placed', 'confirmed', 'packed'].includes(order.status) ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                <span style={{ color: '#15803d', fontWeight: 700 }}>✓ 100% Refund</span> • No processing begun
              </div>
              <button
                disabled={cancelling}
                onClick={() => onCancel(order)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #dc262620',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => !cancelling && (e.currentTarget.style.background = '#fee2e2')}
                onMouseLeave={e => !cancelling && (e.currentTarget.style.background = '#fef2f2')}
              >
                {cancelling ? 'Processing...' : 'Cancel Order'}
              </button>
            </div>
          ) : order.status === 'shipped' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                  <span style={{ color: '#b45309', fontWeight: 700 }}>⚠ Conditional Refund</span> • Shipping fees may be deducted
                </div>
                {order.cancellationRequested ? (
                  <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 800, padding: '6px 12px', background: '#fffbeb', borderRadius: 8 }}>
                    Cancellation Requested
                  </span>
                ) : (
                  <button
                    disabled={cancelling}
                    onClick={() => onCancel(order)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: '1.5px solid #b4530930',
                      background: '#fffbeb',
                      color: '#b45309',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: cancelling ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {cancelling ? 'Sending Request...' : 'Request Cancellation'}
                  </button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                Note: We will try to stop the courier. If they can't be stopped, you may need to refuse at your doorstep.
              </p>
            </div>
          ) : order.status === 'out_for_delivery' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '1.1rem' }}>🚚</span>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gray-700)' }}>Too late to cancel?</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--gray-500)' }}>The driver is en route. Please refuse delivery at your doorstep for a return/refund.</div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

const ProfileOrders = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('niraa_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/orders/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else if (response.status === 401) {
        // Token is invalid or expired
        console.warn('Session expired or unauthorized. Logging out.');
        logout();
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, reasonKey, reasonText) => {
    try {
      const token = localStorage.getItem('niraa_token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reasonKey, reasonText })
      });

      if (response.ok) {
        // Refresh orders after successful cancellation
        await fetchOrders();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel Order Error:', error);
      alert('Error connecting to server');
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = filter === 'all'
    ? safeOrders
    : safeOrders.filter(o => o.status === filter);

  const stats = {
    total: safeOrders.length,
    delivered: safeOrders.filter(o => o.status === 'delivered').length,
    active: safeOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
    totalSpent: safeOrders.reduce((sum, o) => sum + (o.total ?? o.totalAmount ?? 0), 0),
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--gray-50)', minHeight: '70vh', padding: '32px 0 60px' }}>
      <style>{`
        .filter-pill-sm {
          padding: 7px 16px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          border: 1.5px solid rgba(42,125,114,0.18);
          background: #fff;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .filter-pill-sm:hover { border-color: var(--teal); color: var(--teal); }
        .filter-pill-sm.active {
          background: linear-gradient(135deg, var(--teal), var(--teal-dark));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(42,125,114,0.25);
        }
        .stat-mini {
          background: #fff;
          border: 1px solid rgba(42,125,114,0.1);
          border-radius: 18px;
          padding: 16px 14px;
          text-align: center;
          flex: 1;
          min-width: 100px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          transition: all 0.25s ease;
        }
        .stat-mini:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(42,125,114,0.12); }
      `}</style>

      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            background: 'linear-gradient(135deg, #062019, #1a4f47)',
            borderRadius: 24, padding: '26px 24px', color: '#fff',
            boxShadow: '0 16px 40px rgba(6,32,25,0.25)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(200,168,75,0.1)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#aadecd', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Your Account
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                  My Orders
                </h1>
                <p style={{ color: '#aadecd', margin: 0, fontSize: '0.85rem' }}>
                  Track and manage all your NIRAA orders
                </p>
              </div>
              {user?.name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #c8a84b, #d4a843)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '0.9rem' }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{user.name}</div>
                    <div style={{ color: '#aadecd', fontSize: '0.7rem' }}>{user.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {orders.length > 0 && (
          <>
            {/* Stats Strip */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Orders', value: stats.total, icon: '📦' },
                { label: 'Delivered', value: stats.delivered, icon: '✅' },
                { label: 'Active', value: stats.active, icon: '🚚' },
                { label: 'Total Spent', value: `₹${stats.totalSpent}`, icon: '💰' },
              ].map((s, i) => (
                <div key={i} className="stat-mini">
                  <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--teal-dark)', letterSpacing: '-0.02em' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, padding: '14px 16px', background: '#fff', borderRadius: 18, border: '1px solid rgba(42,125,114,0.1)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              {[
                { id: 'all', label: '🏠 All' },
                { id: 'placed', label: '🛎️ Placed' },
                { id: 'confirmed', label: '✅ Confirmed' },
                { id: 'packed', label: '📦 Packed' },
                { id: 'shipped', label: '🚢 Shipped' },
                { id: 'out_for_delivery', label: '🚚 Delivery' },
                { id: 'delivered', label: '🎉 Delivered' },
                { id: 'cancelled', label: '❌ Cancelled' },
              ].map(f => (
                <button
                  key={f.id}
                  className={`filter-pill-sm ${filter === f.id ? 'active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 && orders.length > 0 ? (
          <div style={{
            background: '#fff', borderRadius: 22,
            border: '1px solid rgba(42,125,114,0.1)',
            padding: '50px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 14 }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 8 }}>No orders found</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>No orders match this filter.</p>
            <button onClick={() => setFilter('all')} style={{ marginTop: 16, padding: '10px 22px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}>
              View All Orders
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 24,
            border: '1px solid rgba(42,125,114,0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            padding: '70px 40px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '5rem', marginBottom: 18 }}>📦</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, marginBottom: 8, color: 'var(--gray-800)' }}>
              No orders yet
            </h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 28, fontSize: '0.92rem', maxWidth: 320, margin: '0 auto 28px', lineHeight: 1.7 }}>
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link to="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 30px',
              background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))',
              color: '#fff', textDecoration: 'none', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem',
              boxShadow: '0 8px 24px rgba(42,125,114,0.3)',
            }}>
              <FiPackage size={18} /> Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredOrders.map(order => (
              <OrderCard key={order._id} order={order} onCancel={(o) => setSelectedOrderForCancel(o)} />
            ))}
          </div>
        )}

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