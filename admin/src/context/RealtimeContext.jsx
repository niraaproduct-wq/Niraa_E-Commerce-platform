import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

/**
 * Safely derive a WebSocket base URL from an HTTP(S) API base URL.
 * Uses the URL constructor to correctly parse the origin, avoiding
 * the string-replace bug that corrupts URLs like 'https://api.niraacare.com/api'
 * (where '/api' appears inside the subdomain name and gets stripped first).
 */
function buildWsUrl() {
  // Explicit override — set VITE_WS_URL in Vercel/Render env vars to skip auto-detection
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  try {
    const parsed = new URL(apiBase);
    // Swap protocol: https → wss, http → ws
    const wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use only origin (protocol + host + port), discard the /api path
    return `${wsProtocol}//${parsed.host}/ws`;
  } catch {
    // Fallback for local dev if VITE_API_BASE_URL is not set
    return 'ws://localhost:5000/ws';
  }
}

export const RealtimeProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const reconnectTimer = useRef(null);

  const connect = () => {
    const wsUrl = buildWsUrl();
    console.log("📡 WebSocket URL:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ Admin Realtime connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🔔 Admin Realtime event:', data);
        setLastEvent(data);
      } catch (err) {
        console.error('Failed to parse realtime message:', err);
      }
    };

    ws.onclose = () => {
      console.log('❌ Admin Realtime disconnected, retrying in 5s...');
      setSocket(null);
      reconnectTimer.current = setTimeout(connect, 5000);
    };

    ws.onerror = (err) => {
      console.error('Admin Realtime error:', err);
      ws.close();
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (socket) socket.close();
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ socket, lastEvent }}>
      {children}
    </RealtimeContext.Provider>
  );
};
