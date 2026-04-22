import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../utils/constants';
import AdminBuilder from './AdminBuilder';
import AdminCustomers from './AdminCustomers';
import AdminProducts from './AdminProducts';
import AdminOrdersPage from './AdminOrders';

const AdminLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <aside style={{ width: 250, background: 'var(--teal-dark)', color: '#fff', padding: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 30px', fontSize: '1.8rem' }}>NIRAA Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', fontWeight: 700 }}>Dashboard</Link>
          <Link to="/builder" style={{ color: '#fff', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600 }}>Website Builder</Link>
          <Link to="/products" style={{ color: '#fff', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600 }}>Products</Link>
          <Link to="/orders" style={{ color: '#fff', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600 }}>Orders</Link>
          <Link to="/customers" style={{ color: '#fff', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600 }}>Customers</Link>
          <Link to="/marketing" style={{ color: '#fff', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600 }}>Marketing</Link>
          <a href="https://niraa-customer.vercel.app" style={{ color: '#a3d4ce', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, marginTop: 40, fontSize: '0.9rem' }}>← Back to Website</a>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 30 }}>
        {children}
      </main>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSales: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('niraa_token');
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Customers', 
      value: stats.totalUsers, 
      icon: '👥',
      color: '#2d9a8e',
      bgGradient: 'linear-gradient(135deg, #2d9a8e 0%, #1a7a6e 100%)'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: '📦',
      color: '#c8a84b',
      bgGradient: 'linear-gradient(135deg, #c8a84b 0%, #a8883b 100%)'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: '⏳',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: '🛍️',
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    { 
      title: 'Delivered', 
      value: stats.deliveredOrders, 
      icon: '✅',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    { 
      title: 'Total Sales', 
      value: `₹${stats.totalSales || 0}`, 
      icon: '💰',
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--gray-500)' }}>Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ color: 'var(--gray-800)', marginTop: 0, marginBottom: 8, fontSize: '2rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--gray-600)', margin: 0 }}>Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 30 }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ 
            background: stat.bgGradient, 
            padding: 24, 
            borderRadius: 20, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            color: '#fff',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            ':hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
            }
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 500, marginBottom: 4 }}>{stat.title}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>{stat.value}</div>
              </div>
              <div style={{ fontSize: '2.5rem', opacity: 0.9 }}>{stat.icon}</div>
            </div>
            <div style={{ 
              height: 4, 
              background: 'rgba(255,255,255,0.3)', 
              borderRadius: 2,
              overflow: 'hidden',
              marginTop: 12
            }}>
              <div style={{ 
                height: '100%', 
                width: `${60 + Math.random() * 40}%`, 
                background: '#fff', 
                borderRadius: 2 
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 20, 
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--gray-100)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-800)' }}>Recent Orders</h2>
          <Link to="/orders" style={{ 
            color: 'var(--teal)', 
            textDecoration: 'none', 
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            View All Orders →
          </Link>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--gray-600)' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--gray-600)' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--gray-600)' }}>Total</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--gray-600)' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--gray-600)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order, i) => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--gray-800)' }}>#{String(order._id || order.id || '').slice(-6).toUpperCase()}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--gray-700)' }}>{order.customer?.name || order.customerName || 'Guest'}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--teal-dark)' }}>₹{order.total}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: order.status === 'delivered' ? '#dcfce7' : ['pending', 'placed', 'confirmed'].includes(order.status) ? '#fef3c7' : '#dbeafe',
                      color: order.status === 'delivered' ? '#166534' : ['pending', 'placed', 'confirmed'].includes(order.status) ? '#92400e' : '#1e40af'
                    }}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                    No orders yet. When customers place orders, they will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminInventory = () => (
  <AdminLayout>
    <h1 style={{ color: 'var(--gray-800)', marginTop: 0 }}>Inventory Alerts</h1>
    <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
      <div style={{ background: '#fffcf5', border: '1px solid #f6e0b5', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, color: '#996a10' }}>Low Stock: Floor Cleaner (1lt Refill)</div>
          <div style={{ color: '#b3821a', fontSize: '0.9rem' }}>Only 5 items left in Dharmapuri Hub</div>
        </div>
        <button style={{ background: '#c8a84b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700 }}>Restock</button>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--gray-200)', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, color: 'var(--gray-800)' }}>Toilet Cleaner (1lt Bottle)</div>
          <div style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Stock: 42 units</div>
        </div>
      </div>
    </div>
  </AdminLayout>
);

const AdminOrdersFlow = () => (
  <AdminLayout>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ color: 'var(--gray-800)', marginTop: 0 }}>Active Orders Flow</h1>
      <button style={{ background: 'var(--teal)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700 }}>Refresh</button>
    </div>
    
    <div style={{ display: 'flex', gap: 20, marginTop: 20, overflowX: 'auto', paddingBottom: 20 }}>
      {['New', 'Packed', 'Out for Delivery', 'Delivered'].map(status => (
        <div key={status} style={{ background: '#fff', border: '1px solid var(--gray-200)', width: 300, borderRadius: 16, padding: 16, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontWeight: 800, color: 'var(--gray-800)', marginBottom: 16, borderBottom: '2px solid var(--gray-100)', paddingBottom: 10 }}>{status}</div>
          
          {status === 'New' && (
            <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="badge badge-teal">Combo</span>
                <span style={{ fontWeight: 800 }}>#1042</span>
              </div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>Rajesh K.</div>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Dharmapuri Town</div>
              <button style={{ marginTop: 12, width: '100%', background: '#fff', border: '1px solid var(--gray-300)', padding: '6px', borderRadius: 6, fontWeight: 700 }}>Mark Packed</button>
            </div>
          )}
          {status === 'Out for Delivery' && (
            <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="badge badge-gold">Refill</span>
                <span style={{ fontWeight: 800 }}>#1040</span>
              </div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>Sangeetha</div>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Mathikonpalayam</div>
              <button style={{ marginTop: 12, width: '100%', background: 'var(--teal)', color: '#fff', border: 'none', padding: '6px', borderRadius: 6, fontWeight: 700 }}>Mark Delivered</button>
            </div>
          )}
        </div>
      ))}
    </div>
  </AdminLayout>
);

const AdminMarketing = () => (
  <AdminLayout>
    <h1 style={{ color: 'var(--gray-800)', marginTop: 0 }}>Growth & Marketing</h1>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
      <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ marginTop: 0, color: 'var(--teal-dark)' }}>Push WhatsApp Broadcast</h3>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Send festival offers directly to all active customers via WhatsApp.</p>
        
        <textarea style={{ width: '100%', border: '1px solid var(--gray-300)', borderRadius: 8, padding: 12, height: 100, marginTop: 10, fontFamily: 'var(--font-body)' }} defaultValue="Hi Dharmapuri! Get our Pongal Cleaning Kit at 20% OFF today. Reply YES to order!"></textarea>
        
        <button style={{ background: '#25D366', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 800, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          Broadcast Message 🚀
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ marginTop: 0, color: 'var(--teal-dark)' }}>Active Banners</h3>
        <div style={{ background: '#fdfbfa', border: '2px dashed var(--gold-light)', padding: 16, borderRadius: 12, textAlign: 'center', color: '#c8a84b', fontWeight: 800 }}>
          Deep Cleaning Combo - ₹550
        </div>
        <button style={{ background: '#fff', color: 'var(--teal-dark)', border: '1px solid var(--teal-dark)', padding: '10px 20px', borderRadius: 8, fontWeight: 800, marginTop: 16 }}>
          + Add New Banner
        </button>
      </div>
    </div>
  </AdminLayout>
);

const AdminLogin = ({ setAuth }) => {
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('niraa_token', data.token);
        localStorage.setItem('niraa_user', JSON.stringify(data.user));
        localStorage.setItem('niraa_admin_auth', 'true');
        setAuth(true);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Invalid PIN');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      alert('Error connecting to server. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--teal-dark)', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleLogin} style={{ background: '#fff', padding: 40, borderRadius: 16, width: 400, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--teal-dark)', marginBottom: 10 }}>Company Access</h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: 20 }}>Enter PIN to manage Niraa store</p>
        <input 
          type="password" 
          placeholder="Enter PIN (1234)" 
          value={pin} onChange={e => setPin(e.target.value)}
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--gray-300)', marginBottom: 20, textAlign: 'center', fontSize: '1.2rem', letterSpacing: 4 }}
        />
        <button type="submit" style={{ width: '100%', background: 'var(--teal)', color: '#fff', padding: 14, borderRadius: 8, border: 'none', fontWeight: 800, cursor: 'pointer' }}>
          Secure Login
        </button>
      </form>
    </div>
  );
};

export const AdminRoutes = () => {
  const [auth, setAuth] = useState(() => {
    const user = JSON.parse(localStorage.getItem('niraa_user') || 'null');
    const token = localStorage.getItem('niraa_token');
    return localStorage.getItem('niraa_admin_auth') === 'true' && !!token && user?.role === 'admin';
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
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/products" element={<AdminProducts />} />
      <Route path="/inventory" element={<AdminInventory />} />
      <Route path="/orders" element={<AdminOrdersPage />} />
      <Route path="/customers" element={<AdminCustomers />} />
      <Route path="/marketing" element={<AdminMarketing />} />
      <Route path="/builder" element={<AdminBuilder />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};
