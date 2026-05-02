import React from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { CartProvider }  from './context/CartContext.jsx';
import { AuthProvider }  from './context/AuthContext.jsx';
import { RealtimeProvider } from './context/RealtimeContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </RealtimeProvider>
    </AuthProvider>
  );
}
