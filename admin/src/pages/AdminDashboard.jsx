import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="admin container" style={{ padding: 18 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <Link to="/admin/products" style={{ padding: 12, background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 8 }}>Products</Link>
        <Link to="/admin/orders" style={{ padding: 12, background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 8 }}>Orders</Link>
        <Link to="/admin/customers" style={{ padding: 12, background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 8 }}>Customers</Link>
      </div>
    </div>
  );
}
