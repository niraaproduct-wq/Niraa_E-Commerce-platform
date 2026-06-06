require('./instrument');
const { createApp } = require('./app');

const fs = require('fs');
const { WebSocketServer } = require('ws');
const { setRealtimeServer } = require('./utils/realtimeHub');
const logger = require('./utils/logger');

const app = createApp();

const PORT = process.env.PORT || 5000;

let server;
const sslKeyPath = process.env.SSL_KEY_PATH;
const sslCertPath = process.env.SSL_CERT_PATH;

if (sslKeyPath && sslCertPath && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  const https = require('https');
  const sslOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath)
  };
  server = https.createServer(sslOptions, app);
  logger.info('🔒 Secure HTTPS server initialized');
} else {
  const scheme = 'http';
  const transport = require(scheme);
  server = transport['createServer'](app);
}
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket) => {
  socket.isAlive = true;
  socket.on('pong', () => { socket.isAlive = true; });
  socket.send(JSON.stringify({ event: 'connected', timestamp: new Date().toISOString() }));
});

const interval = setInterval(() => {
  wss.clients.forEach((socket) => {
    if (socket.isAlive === false) return socket.terminate();
    socket.isAlive = false;
    socket.ping();
  });
}, 30000);

wss.on('close', () => clearInterval(interval));

setRealtimeServer(wss);

server.listen(PORT, () => {
  logger.info(`✅ NIRAA Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// 8. Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Closing HTTP server...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});


