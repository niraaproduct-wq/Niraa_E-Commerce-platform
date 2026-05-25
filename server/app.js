const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { apiLimiter } = require('./middleware/security');
const logger = require('./utils/logger');
const requestId = require('./middleware/requestId');

// Import routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const testRoutes = require('./routes/testRoutes');
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const marketingRoutes = require('./routes/marketingRoutes');

function createApp() {
  const app = express();
  
  // Trust proxy is required when deployed behind Render/Vercel load balancers
  // to ensure rate limiters use the real client IP instead of the proxy IP
  app.set('trust proxy', 1);

  // 1. Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https://res.cloudinary.com", "https://*.firebase.com", "https://*.googleapis.com"],
        "connect-src": ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com"],
        "script-src": ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
        "frame-src": ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      },
    },
    hsts: process.env.NODE_ENV === 'production', // Enable HSTS in production
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false, // Often needed for third-party images/scripts
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // 2. CORS Configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://niraacare.com',
    'https://www.niraacare.com',
    'https://admin.niraacare.com',
    'https://niraa-customer.vercel.app', // Legacy/Staging
    'https://niraa-admin.vercel.app',    // Legacy/Staging
  ];

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowed => 
        origin === allowed || origin.endsWith('.niraacare.com')
      );

      if (!isAllowed && process.env.NODE_ENV === 'production') {
        logger.warn(`Blocked CORS request from origin: ${origin}`);
        return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }));

  // 3. Request ID
  app.use(requestId);

  // 4. Rate Limiting
  app.use('/api/', apiLimiter);

  // 5. Cookies (for HttpOnly auth)
  app.use(cookieParser());

  app.use(express.json({ 
    limit: '2mb',
    verify: (req, res, buf) => {
      // Capture raw body for webhook signature verification
      if (req.originalUrl && req.originalUrl.includes('/webhook')) {
        req.rawBody = buf;
      }
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // 6. Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
      });
    });
    next();
  });

  // 7. Health check
  app.get('/healthz', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/sections', sectionRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/locations', locationRoutes);
  app.use('/api/payments', paymentRoutes);
  // Test routes only in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api/test', testRoutes);
  }
  app.use('/api/marketing', marketingRoutes);

  // Root path
  app.get('/', (req, res) => {
    res.json({ message: 'NIRAA API is running 🌿', status: 'ok' });
  });

  // Error handler — never expose stack traces or internal details in production
  app.use((err, req, res, next) => {
    const isProd = process.env.NODE_ENV === 'production';
    logger.error(err.message, {
      requestId: req.id,
      stack: isProd ? undefined : err.stack,
      url: req.originalUrl,
      method: req.method,
    });

    const status = err.status || 500;
    const message = isProd ? 'Something went wrong. Please try again later.' : (err.message || 'Something went wrong!');

    res.status(status).json({
      message,
      ...(isProd ? {} : { error: err.message }),
    });
  });

  return app;
}

module.exports = { createApp };

