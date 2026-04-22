import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../utils/constants.js';
import Loader from '../components/Loader.jsx';

const ProfileOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('niraa_token');
      const response = await fetch(`${API_BASE_URL}/orders/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ca8a04',
      confirmed: '#2563eb',
      packed: '#7c3aed',
      shipped: '#0ea5e9',
      out_for_delivery: '#0891b2',
      delivered: '#16a34a',
      cancelled: '#dc2626'
    };
    return colors[status] || 'var(--gray-500)';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      packed: 'Packed',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0', background: 'var(--gray-50)', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 700, 
            color: 'var(--gray-800)',
            marginBottom: 8
          }}>
            My Orders
          </h1>
          <p style={{ color: 'var(--gray-500)', margin: 0 }}>
            Track and manage all your orders
          </p>
        </div>

        {orders.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: 'var(--shadow-sm)',
            padding: 60,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📦</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>No orders yet</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                background: 'var(--teal)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 10,
                fontWeight: 700
              }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div
                key={order._id}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: 'var(--shadow-sm)',
                  padding: 20,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 4 }}>Order #{order._id?.slice(-8).toUpperCase()}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: `${getStatusColor(order.status)}15`,
                    color: getStatusColor(order.status)
                  }}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                {order.items?.slice(0, 2).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: 'var(--gray-100)',
                      overflow: 'hidden'
                    }}>
                      {item.image && (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        {item.quantity} × ₹{item.price}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}

                {order.items?.length > 2 && (
                  <div style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.85rem', padding: '8px 0' }}>
                    + {order.items.length - 2} more items
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid var(--gray-100)'
                }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                    {order.items?.reduce((sum, i) => sum + i.quantity, 0)} items
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--teal-dark)' }}>
                    Total: ₹{order.totalAmount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileOrders;