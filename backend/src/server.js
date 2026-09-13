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
  // Never let credentials reach the log stream. pino-http's default request
  // serializer includes the full headers object, and the app deliberately
  // logs every 4xx/5xx — which happens on routine events like a bad login or
  // an expired token — so without this, live JWTs and the refresh cookie
  // would be written to logs in plaintext.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-refresh-token"]',
      'res.headers["set-cookie"]',
    ],
    censor: '[redacted]',
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
// SECURITY: ".vercel.app" is a shared public namespace — anyone can deploy a
// free project there — so trusting it by default would grant any
// attacker-controlled "*.vercel.app" page a credentialed CORS relationship
// with this API. Preview-domain trust is opt-in only, via a narrow,
// project-specific suffix (e.g. "-my-team.vercel.app"); see lib/cors.js.
const { isOriginAllowed, loadCorsConfig } = require('./lib/cors');
const corsConfig = loadCorsConfig(process.env);

if (corsConfig.hasBarePublicSuffix) {
  console.error('[startup] ALLOWED_VERCEL_DOMAINS must not be the bare "vercel.app" public suffix — refusing to start.');
  process.exit(1);
}
if (process.env.VERCEL && corsConfig.allowedVercelDomains.length === 0) {
  console.warn('[startup] ALLOWED_VERCEL_DOMAINS is not set — no Vercel preview-deployment origins will be trusted (only CLIENT_URL and this deployment\'s own URL).');
}

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin, corsConfig)) return callback(null, true);
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

// ─── Cookie parser (needed for httpOnly refresh token) ───────────────────────
// Lightweight inline parser — avoids adding a dependency.
app.use((req, _res, next) => {
  req.cookies = {};
  const raw = req.headers.cookie;
  if (raw) {
    for (const pair of raw.split(';')) {
      const idx = pair.indexOf('=');
      if (idx < 0) continue;
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      req.cookies[key] = decodeURIComponent(val);
    }
  }
  next();
});

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

// check-email/check-phone exist to give signup-form UX feedback while
// typing, but they also reveal whether an account exists — the generic
// apiLimiter (120/min) is far too loose for an existence-revealing endpoint,
// letting mass account enumeration at a rate no legitimate typing UX needs.
const enumerationLimiter = rateLimit({
  windowMs:        5 * 60 * 1000,
  max:             15, // 15 checks per 5 min per IP — plenty for real typing, not for scraping
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many requests, please slow down.' },
});

app.use('/api/auth/login',           authLimiter);
app.use('/api/auth/register',        authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password',  authLimiter);
app.use('/api/auth/check-email',     enumerationLimiter);
app.use('/api/auth/check-phone',     enumerationLimiter);
app.use('/api',                      apiLimiter);

// ─── Static uploads (local-dev fallback) ─────────────────────────────────────
// In production files live in Vercel Blob (absolute URLs); this mount only
// serves files saved locally when no BLOB_READ_WRITE_TOKEN is configured.
const { LOCAL_DIR } = require('./lib/storage');
app.use('/uploads', express.static(LOCAL_DIR, {
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
app.use('/api/search',        require('./routes/search'));
app.use('/api/leads',         require('./routes/leads'));

// ─── Health check (verifies DB + realtime stats) ─────────────────────────────
app.get('/api/health', async (req, res) => {
  const realtime = require('./lib/realtime');
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status:    'ok',
      db:        'connected',
      realtime:  { ...realtime.stats(), ...realtime.getStatus() },
      storage:   { blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN },
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

// ─── Background reconciler ────────────────────────────────────────────────────
// In dev: runs every 10 min via setInterval.
// In production (Vercel serverless): only runs via POST /api/payments/reconcile.
// Also runs once on each cold-start to fix any leftover stuck payments quickly.
const { startReconcilerLoop, runReconciliation } = require('./jobs/reconcile');
if (process.env.NODE_ENV !== 'production') {
  startReconcilerLoop();
} else {
  // Cold-start reconciliation: fire-and-forget, won't block the response
  runReconciliation().catch((err) => {
    console.error('[reconcile] Cold-start run failed:', err.message);
  });
}

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
