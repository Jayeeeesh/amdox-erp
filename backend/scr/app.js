const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const crypto = require('crypto');

// Middlewares
const errorHandler = require('./middleware/error.middleware');
const notFound = require('./middleware/notFound.middleware');

// Swagger Docs
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { API_VERSION } = require('./config/env');

// Environment Validation
const requiredEnv = ['PORT', 'API_VERSION'];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Missing environment variable: ${env}`);
  }
});

const app = express();

// Hide Express version
app.disable('x-powered-by');

// Trust Proxy
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(hpp());

// CORS Production Ready
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
];
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});
app.use('/api', apiLimiter);

// Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts',
  },
});
app.use(`/api/${API_VERSION}/auth`, authLimiter);

// Compression
app.use(compression({ level: 6, threshold: 1024 }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser
app.use(cookieParser());

// Request ID Tracking
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});

// Response Time Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${req.requestId}] ${req.method} ${req.originalUrl} - ${ms}ms`);
  });
  next();
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    application: 'Amdox ERP API',
    status: 'UP',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Amdox ERP API Running',
  });
});

// Swagger Docs
if (process.env.NODE_ENV !== 'production') {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
}

// Routes
app.use(`/api/${API_VERSION}`, require('./routes'));

// Invalid JSON Handler
app.use((err, req, res, next) => {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
    });
  }
  next(err);
});

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;