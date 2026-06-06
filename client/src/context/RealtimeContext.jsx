import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '../utils/constants';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const reconnectTimer = useRef(null);

  const connect = () => {
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

    console.log('📡 Attempting Realtime connection to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ Realtime connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🔔 Realtime event:', data);
        setLastEvent(data);
      } catch (err) {
        console.error('Failed to parse realtime message:', err);
      }
    };

    ws.onclose = () => {
      console.log('❌ Realtime disconnected, retrying in 5s...');
      setSocket(null);
      reconnectTimer.current = setTimeout(connect, 5000);
    };

    ws.onerror = (err) => {
      console.error('Realtime error:', err);
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
