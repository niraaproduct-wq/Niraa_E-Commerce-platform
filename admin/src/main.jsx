import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './assets/styles/global.css';
import './assets/styles/theme-overrides.css';
import './assets/styles/pages.css';

// Global fetch wrapper to handle Render backend cold starts and auth failures
const originalFetch = window.fetch;
let isRedirectingToLogin = false;
window.fetch = async function (...args) {
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await originalFetch.apply(this, args);

      // Handle invalid/expired tokens — auto-logout and redirect to login
      if (response.status === 401) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
        // Only auto-logout for API calls (not the login endpoint itself)
        if (url.includes('/api/') && !url.includes('/auth/admin-login') && !isRedirectingToLogin) {
          const data = await response.clone().json().catch(() => ({}));
          console.log('Admin Fetch Error: 401', data);
          isRedirectingToLogin = true;
          localStorage.removeItem('niraa_token');
          localStorage.removeItem('niraa_user');
          localStorage.removeItem('niraa_admin_auth');
          // Small delay to batch clear, then redirect
          setTimeout(() => {
            isRedirectingToLogin = false;
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 300);
        }
        return response;
      }

      // If the backend is waking up, Render might return a 502 Bad Gateway
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error(`Server waking up (Status: ${response.status})`);
      }
      return response;
    } catch (error) {
      retries -= 1;
      if (retries === 0) throw error;
      console.log(`Backend waking up... Retrying request in 3 seconds. (${3 - retries}/3)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.9rem',
            borderRadius: '10px',
            background: '#1e5c53',
            color: '#fff',
          },
          success: { iconTheme: { primary: '#c8a84b', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
