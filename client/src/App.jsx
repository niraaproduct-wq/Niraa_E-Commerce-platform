import React from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { CartProvider }  from './context/CartContext.jsx';
import { AuthProvider }  from './context/AuthContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import AdminToolbar from './components/AdminToolbar.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <AppRoutes />
          <AdminToolbar />
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
