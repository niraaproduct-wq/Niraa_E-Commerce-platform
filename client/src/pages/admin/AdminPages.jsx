import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <aside style={{ width: 250, background: 'var(--teal-dark)', color: '#fff', padding: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 30px', fontSize: '1.8rem' }}>NIRAA Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="/admin" style={{ color: '#fff', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', fontWeight: 700 }}>Dashboard</a>
          <a href="/admin/inventory" style={{ color: '#fff', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600 }}>Inventory</a>
          <a href="/admin/orders" style={{ color: '#fff', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600 }}>Orders</a>
          <a href="/admin/marketing" style={{ color: '#fff', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600 }}>Marketing</a>
          <a href="/" style={{ color: '#a3d4ce', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, marginTop: 40, fontSize: '0.9rem' }}>← Back to Website</a>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 30 }}>
        {children}
      </main>
    </div>
  );
};

const AdminDashboard = () => (
  <AdminLayout>
    <h1 style={{ color: 'var(--gray-800)', marginTop: 0 }}>Dashboard</h1>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 20 }}>
      {/* Metrics */}
      {[
        { title: 'Total Sales Today', value: '₹4,500', trend: '+15%' },
        { title: 'Orders Today', value: '12', trend: '+2' },
        { title: 'Active Subscriptions', value: '28', trend: '+5' },
      ].map((m, i) => (
        <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--gray-600)', fontWeight: 600 }}>{m.title}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal-dark)', lineHeight: 1 }}>{m.value}</div>
            <div style={{ color: 'var(--green)', fontWeight: 800, fontSize: '0.9rem' }}>{m.trend}</div>
          </div>
        </div>
      ))}
    </div>
    
    <div style={{ marginTop: 30, background: '#fff', padding: 24, borderRadius: 16, border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--gray-400)', fontWeight: 600 }}>Revenue Graph Placeholder (Chart.js would go here)</div>
    </div>
  </AdminLayout>
);

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

const AdminOrders = () => (
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

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1234') { // Mock secure pin
      localStorage.setItem('niraa_admin_auth', 'true');
      setAuth(true);
      navigate('/admin/dashboard');
    } else {
      alert('Invalid PIN');
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
  const [auth, setAuth] = useState(localStorage.getItem('niraa_admin_auth') === 'true');

  if (!auth) {
    return (
      <Routes>
        <Route path="/login" element={<AdminLogin setAuth={setAuth} />} />
        <Route path="*" element={<Navigate to="/admin/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/inventory" element={<AdminInventory />} />
      <Route path="/orders" element={<AdminOrders />} />
      <Route path="/marketing" element={<AdminMarketing />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" />} />
    </Routes>
  );
};
