import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '../utils/constants';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const isMounted = useRef(true);
  const reconnectTimer = useRef(null);
  const socketRef = useRef(null);

  const connect = () => {
    // If already connecting or connected, don't start another one
    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsUrl;
    
    if (import.meta.env.DEV) {
      wsUrl = `${protocol}//${window.location.hostname}:5000/ws`;
    } else {
      // In production, derive WS URL from the backend API URL (API_BASE_URL)
      const apiUrl = API_BASE_URL || '';
      
      if (apiUrl.startsWith('http')) {
        // Absolute URL: extract protocol and host
        const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
        const host = apiUrl.replace(/^https?:\/\//, '').split('/')[0];
        wsUrl = `${wsProtocol}//${host}/ws`;
      } else {
        // Relative URL or empty: use current host
        wsUrl = `${protocol}//${window.location.host}/ws`;
      }
    }

    console.log('📡 Attempting Admin Realtime connection to:', wsUrl);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      if (isMounted.current) {
        console.log('✅ Admin Realtime connected');
        setSocket(ws);
      }
    };

    ws.onmessage = (event) => {
      if (!isMounted.current) return;
      try {
        const data = JSON.parse(event.data);
        console.log('🔔 Admin Realtime event:', data);
        setLastEvent(data);
      } catch (err) {
        console.error('Failed to parse realtime message:', err);
      }
    };

    ws.onclose = () => {
      if (isMounted.current) {
        console.log('❌ Admin Realtime disconnected, retrying in 5s...');
        setSocket(null);
        socketRef.current = null;
        reconnectTimer.current = setTimeout(connect, 5000);
      }
    };

    ws.onerror = (err) => {
      // Error will trigger onclose, so we just log it here
      console.error('Admin Realtime connection error');
    };
  };

  useEffect(() => {
    isMounted.current = true;
    connect();
    
    return () => {
      isMounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (socketRef.current) {
        socketRef.current.onclose = null; // Prevent reconnect logic
        socketRef.current.onerror = null;
        // Only close if it's actually open to avoid warnings
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.close();
        }
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ socket, lastEvent }}>
      {children}
    </RealtimeContext.Provider>
  );
};
