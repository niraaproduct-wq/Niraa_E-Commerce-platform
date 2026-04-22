import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './assets/styles/global.css';
import './assets/styles/theme-overrides.css';
import './assets/styles/pages.css';

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
