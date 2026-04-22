import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './assets/styles/global.css';
import './assets/styles/theme-overrides.css';
import './assets/styles/pages.css';

// Global fetch wrapper to handle Render backend cold starts
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await originalFetch.apply(this, args);
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
    <BrowserRouter>
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