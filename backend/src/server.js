require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const path         = require('path');
const prisma       = require('./lib/prisma');

const app = express();

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

// ─── JSON parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

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

// ─── Health check (verifies DB) ──────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status:    'ok',
      db:        'connected',
      uptime:    process.uptime(),
      timestamp: new Date().toISOString(),
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

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  // CORS errors come through here
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Don't leak stack traces in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
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
