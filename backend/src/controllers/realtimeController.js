'use strict';

const jwt      = require('jsonwebtoken');
const prisma   = require('../lib/prisma');
const realtime = require('../lib/realtime');

// ─── SSE authentication ───────────────────────────────────────────────────────
// EventSource doesn't support custom headers, so the JWT is passed as a query
// param. We verify it exactly like the protect middleware, including iat vs.
// passwordChangedAt so that password changes immediately close SSE sessions.

async function authenticateSseRequest(req) {
  const token = req.query?.token;
  if (!token || typeof token !== 'string') return null;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({
    where:  { id: decoded.id },
    select: { id: true, role: true, isActive: true, passwordChangedAt: true },
  });

  if (!user || !user.isActive) return null;

  // Reject tokens issued before the last password change
  if (user.passwordChangedAt) {
    const changedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (decoded.iat < changedAtSec) return null;
  }

  return user;
}

// ─── GET /api/realtime/stream?token=<jwt> ────────────────────────────────────

exports.stream = async (req, res) => {
  const user = await authenticateSseRequest(req);
  if (!user) {
    // Must send a JSON error BEFORE writing SSE headers
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  // ── SSE headers ──
  res.writeHead(200, {
    'Content-Type':      'text/event-stream',
    'Cache-Control':     'no-cache, no-transform',
    'Connection':        'keep-alive',
    'X-Accel-Buffering': 'no', // disable nginx buffering
    // Prevent Vercel edge from buffering
    'Transfer-Encoding': 'chunked',
  });
  res.flushHeaders?.();

  // ── Initial ready event ──
  res.write(`event: ready\n`);
  res.write(`data: ${JSON.stringify({ userId: user.id, role: user.role, ts: Date.now() })}\n\n`);

  const unsubscribe = realtime.subscribe(user.id, user.role, res);

  // ── Heartbeat every 25 s ──
  // Keeps proxies from closing idle connections and allows clients to
  // detect a dead stream within ~30 s.
  const heartbeat = setInterval(() => {
    if (res.writableEnded || res.destroyed) {
      cleanup();
      return;
    }
    try {
      res.write(`: ping ${Date.now()}\n\n`);
    } catch {
      cleanup();
    }
  }, 25_000);

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    clearInterval(heartbeat);
    unsubscribe();
    if (!res.writableEnded) {
      try { res.end(); } catch {}
    }
  };

  req.on('close',   cleanup);
  req.on('aborted', cleanup);
  res.on('error',   cleanup);
  res.on('finish',  cleanup);
};
