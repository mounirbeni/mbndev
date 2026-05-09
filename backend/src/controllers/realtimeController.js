const jwt    = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const realtime = require('../lib/realtime');

// SSE auth via query token — EventSource doesn't support custom headers,
// so the client passes ?token=<jwt>. We verify it identically to the
// regular protect middleware.
async function authenticateSseRequest(req) {
  const token = req.query?.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where:  { id: decoded.id },
      select: { id: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

// GET /api/realtime/stream?token=<jwt>
exports.stream = async (req, res) => {
  const user = await authenticateSseRequest(req);
  if (!user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  // SSE headers
  res.writeHead(200, {
    'Content-Type':                'text/event-stream',
    'Cache-Control':               'no-cache, no-transform',
    'Connection':                  'keep-alive',
    'X-Accel-Buffering':           'no', // disable nginx buffering
  });

  // Initial hello — tells the client the stream is open
  res.write(`event: ready\n`);
  res.write(`data: ${JSON.stringify({ userId: user.id, role: user.role, ts: Date.now() })}\n\n`);

  const unsubscribe = realtime.subscribe(user.id, user.role, res);

  // Heartbeat every 25s — keeps proxies from closing the connection
  // and lets the client detect a dead connection within ~30s
  const heartbeat = setInterval(() => {
    try { res.write(`: ping ${Date.now()}\n\n`); }
    catch { /* connection dead */ }
  }, 25_000);

  const cleanup = () => {
    clearInterval(heartbeat);
    unsubscribe();
    try { res.end(); } catch {}
  };

  req.on('close', cleanup);
  req.on('aborted', cleanup);
  res.on('error', cleanup);
};
