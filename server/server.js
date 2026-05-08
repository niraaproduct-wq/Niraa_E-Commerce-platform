// NIRAA Server - Last Deploy: 2026-05-07
const path = require('path');
const dotenv = require('dotenv');
const { createApp } = require('./app');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const http = require('http');
const { WebSocketServer } = require('ws');
const { setRealtimeServer } = require('./utils/realtimeHub');
const logger = require('./utils/logger');

const app = createApp();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ event: 'connected', timestamp: new Date().toISOString() }));
});

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


