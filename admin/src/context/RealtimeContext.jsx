import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const reconnectTimer = useRef(null);

  const connect = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In development, the backend usually runs on port 5000
    let wsUrl;
    if (import.meta.env.DEV) {
      wsUrl = `${protocol}//${window.location.hostname}:5000/ws`;
    } else {
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }

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
