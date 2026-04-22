import React from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { CartProvider }  from './context/CartContext.jsx';
import { AuthProvider }  from './context/AuthContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}
