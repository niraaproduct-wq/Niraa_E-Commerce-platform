import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import './assets/styles/global.css';
import './assets/styles/theme-overrides.css';
import './assets/styles/pages.css';
import { API_BASE_URL } from './utils/constants';

// Initialize Sentry for client error tracking and browser telemetry
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE || 'production',
    sendDefaultPii: true,
  });
}

let csrfToken = null;
let csrfPromise = null;

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  if (!csrfPromise) {
    csrfPromise = (async () => {
      try {
        const res = await originalFetch(`${API_BASE_URL}/auth/csrf-token`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          csrfToken = data.csrfToken;
        }
      } catch (err) {
        console.error('Failed to load CSRF token:', err);
      }
      csrfPromise = null;
      return csrfToken;
    })();
  }
  return csrfPromise;
}

// Global fetch wrapper to handle Render backend cold starts and inject CSRF tokens
const originalFetch = window.fetch;
window.fetch = async function (input, init = {}) {
  // Determine url and options
  const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

  // If it's a mutating request, and not the csrf-token request itself
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  const isCsrfRequest = url && url.includes('/auth/csrf-token');

  let finalInit = { ...init };

  if (isMutating && !isCsrfRequest) {
    const token = await getCsrfToken();
    if (token) {
      if (input instanceof Request) {
        const headers = new Headers(input.headers);
        headers.set('X-CSRF-Token', token);
        finalInit.headers = headers;
      } else {
        if (!finalInit.headers) finalInit.headers = {};
        if (finalInit.headers instanceof Headers) {
          finalInit.headers.set('X-CSRF-Token', token);
        } else {
          finalInit.headers['X-CSRF-Token'] = token;
        }
      }
    }
  }

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await originalFetch.call(this, input, finalInit);
      // If the backend is waking up, Render might return a 502 Bad Gateway
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error(`Server waking up (Status: ${response.status})`);
      }

      // Clear token cache on login, register, or logout to handle transition to new session
      if (response.ok && url && (
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/admin-login') ||
        url.includes('/auth/logout')
      )) {
        csrfToken = null;
      }

      // Handle token expiration/reset on 403 CSRF failure with transparent retry
      if (response.status === 403 && isMutating) {
        const clonedResponse = response.clone();
        try {
          const body = await clonedResponse.json();
          if (body?.message && body.message.toLowerCase().includes('csrf')) {
            csrfToken = null;
            // Fetch fresh token and retry the mutating request once
            const newToken = await getCsrfToken();
            if (newToken) {
              let retryInit = { ...finalInit };
              if (input instanceof Request) {
                const headers = new Headers(input.headers);
                headers.set('X-CSRF-Token', newToken);
                retryInit.headers = headers;
              } else {
                if (!retryInit.headers) retryInit.headers = {};
                if (retryInit.headers instanceof Headers) {
                  retryInit.headers.set('X-CSRF-Token', newToken);
                } else {
                  retryInit.headers['X-CSRF-Token'] = newToken;
                }
              }
              return await originalFetch.call(this, input, retryInit);
            }
          }
        } catch (_) {}
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
    <HelmetProvider>
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
    </HelmetProvider>
  </React.StrictMode>
);