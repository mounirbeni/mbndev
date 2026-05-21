require('dotenv').config();

// ─── Startup env validation ───────────────────────────────────────────────────
const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CLIENT_URL',
];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.error(`[startup] Missing required environment variable(s): ${missingEnv.join(', ')}`);
  process.exit(1);
}

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const hpp          = require('hpp');
const rateLimit    = require('express-rate-limit');
const crypto       = require('crypto');
const path         = require('path');
const prisma             = require('./lib/prisma');
const pinoHttp           = require('pino-http');
const { sanitizeBody }   = require('./middleware/sanitize');

const app = express();

// ─── Request logging (errors only: 4xx / 5xx) ────────────────────────────────
app.use(pinoHttp({
  autoLogging: {
    ignore: (req) => false, // let customSuccessMessage suppress 2xx/3xx below
  },
  customSuccessMessage: () => false,          // suppress successful responses
  customErrorMessage:   (req, res) =>
    `${req.method} ${req.url} → ${res.statusCode}`,
  // Only write a log line when the status is 400+
  customAttributeKeys: { responseTime: 'ms' },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400)        return 'warn';
    return 'silent'; // suppress 1xx / 2xx / 3xx entirely
  },
}));

// Trust proxy (Vercel / nginx) — required for express-rate-limit and X-Forwarded-For
app.set('trust proxy', 1);

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  // We render uploaded files cross-origin, so disable COEP for /uploads
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Frontend Next.js owns CSP
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://mbndev.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

const allowedVercelDomains = (process.env.ALLOWED_VERCEL_DOMAINS || '.vercel.app')
  .split(',').map((d) => d.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Only allow specific vercel preview domains (configured via env)
    if (allowedVercelDomains.some((d) => origin.endsWith(d))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ─── Request ID ──────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const id = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
});

// ─── HTTP Parameter Pollution protection ─────────────────────────────────────
app.use(hpp());

// ─── JSON parsing (tight limits per surface) ─────────────────────────────────
// Auth endpoints only need small payloads
app.use('/api/auth',  express.json({ limit: '32kb' }));
app.use('/api/auth',  express.urlencoded({ extended: false, limit: '32kb' }));
// File upload routes handled by multer — no global body parsing needed there
// Everything else: 256kb (generous but bounded)
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

// ─── Sanitize req.body (strip HTML tags / null bytes) ────────────────────────
app.use(sanitizeBody);

// ─── Rate limiting ───────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             20, // 20 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many auth attempts, please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             120, // 120 req/min per IP for general API
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many requests, please slow down.' },
});

app.use('/api/auth/login',           authLimiter);
app.use('/api/auth/register',        authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password',  authLimiter);
app.use('/api',                      apiLimiter);

// ─── Static uploads ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '7d',
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/packages',      require('./routes/packages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/realtime',      require('./routes/realtime'));

// ─── Health check (verifies DB + realtime stats) ─────────────────────────────
app.get('/api/health', async (req, res) => {
  const realtime = require('./lib/realtime');
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status:    'ok',
      db:        'connected',
      realtime:  realtime.stats(),
      uptime:    process.uptime(),
      timestamp: new Date().toISOString(),
      version:   process.env.npm_package_version || '1.0.0',
    });
  } catch (err) {
    res.status(503).json({
      status:    'error',
      db:        'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// Structured: logs request ID + status so errors are traceable in Vercel logs.
app.use((err, req, res, _next) => {
  // CORS errors
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Multer errors (file upload validation)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Maximum 10 MB.' });
  }
  if (err.message?.startsWith('File extension') || err.message?.startsWith('MIME type')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const status  = err.status || err.statusCode || 500;
  const isProd  = process.env.NODE_ENV === 'production';
  const reqId   = req.requestId || 'unknown';

  if (status >= 500) {
    // Always log 5xx — structured so Vercel can index it
    console.error(JSON.stringify({
      level:     'error',
      requestId: reqId,
      method:    req.method,
      url:       req.originalUrl,
      status,
      message:   err.message,
      stack:     isProd ? undefined : err.stack,
    }));
  }

  res.status(status).json({
    success:   false,
    message:   isProd && status >= 500 ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
    requestId: reqId,
  });
});

// ─── Server startup + graceful shutdown ──────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`MBN DEV API listening on :${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received — closing server gracefully...`);
    server.close(async () => {
      await prisma.$disconnect().catch(() => {});
      console.log('Server closed.');
      process.exit(0);
    });
    // Force-quit if cleanup hangs
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

module.exports = app;
