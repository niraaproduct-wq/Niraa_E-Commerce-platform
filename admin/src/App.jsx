import React from 'react';
import { AuthProvider }  from './context/AuthContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import { AdminRoutes }   from './pages/AdminPages.jsx';
import { RealtimeProvider } from './context/RealtimeContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <AdminProvider>
          <AdminRoutes />
        </AdminProvider>
      </RealtimeProvider>
    </AuthProvider>
  );
}
