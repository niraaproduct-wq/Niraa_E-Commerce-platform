import React from 'react';
import { AuthProvider }  from './context/AuthContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import { AdminRoutes }   from './pages/AdminPages.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <AdminRoutes />
      </AdminProvider>
    </AuthProvider>
  );
}
