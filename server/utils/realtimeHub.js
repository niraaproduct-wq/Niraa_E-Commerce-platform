let wsServer = null;

const setRealtimeServer = (wss) => {
  wsServer = wss;
};

const publishEvent = (event, payload = {}) => {
  if (!wsServer) return;

  const message = JSON.stringify({
    event,
    payload,
    timestamp: new Date().toISOString(),
  });

  wsServer.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
};

module.exports = {
  setRealtimeServer,
  publishEvent,
};
