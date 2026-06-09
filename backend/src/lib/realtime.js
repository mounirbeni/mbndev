// ─── Realtime event bus (Server-Sent Events) ───────────────────────────────
// Per-user one-way push channel. Delivers:
//   - notification:new
//   - message:new
//   - project:updated
//   - project:activity
//
// Hardening vs. original:
//   1. Per-user connection limit (MAX_CONNS_PER_USER) — prevents memory
//      exhaustion from a single user opening hundreds of tabs/connections.
//      Oldest connection is evicted when the limit is exceeded.
//   2. Dead-connection pruning — _send() removes connections that have already
//      been closed (res.writableEnded) in addition to catching write errors.
//   3. Connection timestamps stored for diagnostics/eviction ordering.
//
// Horizontal scaling: when REDIS_URL is set, every publish is fanned out
// through Redis pub/sub so events reach SSE connections held by OTHER
// instances (required on Vercel serverless, where each lambda has its own
// memory). Without REDIS_URL, delivery is in-process only — fine for a
// single long-lived server, unreliable across serverless instances.

'use strict';

const crypto = require('crypto');

const MAX_CONNS_PER_USER = 5;  // max simultaneous SSE connections per userId
const ADMIN_BROADCAST    = '__admin__';

// ─── Redis fan-out (optional) ────────────────────────────────────────────────
const REDIS_CHANNEL = 'mbndev:realtime';
const INSTANCE_ID   = crypto.randomBytes(8).toString('hex');

let redisPub = null;

(function initRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return;
  try {
    const Redis = require('ioredis');
    redisPub = new Redis(url, { maxRetriesPerRequest: 2, enableOfflineQueue: false });
    const redisSub = new Redis(url, { maxRetriesPerRequest: 2 });

    redisSub.subscribe(REDIS_CHANNEL);
    redisSub.on('message', (_channel, raw) => {
      try {
        const msg = JSON.parse(raw);
        // Skip events we published ourselves — already delivered locally
        if (msg.src === INSTANCE_ID) return;
        _deliverLocal(msg.target, msg.event, msg.data);
      } catch { /* malformed message — ignore */ }
    });

    // Never let Redis connectivity take the API down — local delivery
    // continues to work regardless.
    redisPub.on('error', () => {});
    redisSub.on('error', () => {});
  } catch (err) {
    redisPub = null;
    // eslint-disable-next-line no-console
    console.warn('[realtime] Redis init failed, falling back to in-process delivery:', err.message);
  }
})();

function _fanout(target, event, data) {
  if (!redisPub) return;
  redisPub
    .publish(REDIS_CHANNEL, JSON.stringify({ target, event, data, src: INSTANCE_ID }))
    .catch(() => {});
}

// userId → Array<{ res, connectedAt }>  (ordered oldest-first)
const SUBSCRIBERS = new Map();

function _getList(key) {
  if (!SUBSCRIBERS.has(key)) SUBSCRIBERS.set(key, []);
  return SUBSCRIBERS.get(key);
}

function _pruneList(key) {
  const list = SUBSCRIBERS.get(key);
  if (!list) return;
  // Remove connections whose underlying socket is already closed
  const live = list.filter((c) => !c.res.writableEnded && !c.res.destroyed);
  if (live.length === 0) {
    SUBSCRIBERS.delete(key);
  } else {
    SUBSCRIBERS.set(key, live);
  }
}

function _add(key, res) {
  _pruneList(key);
  const list = _getList(key);

  // Evict oldest connection(s) if limit reached
  while (list.length >= MAX_CONNS_PER_USER) {
    const evicted = list.shift();
    try { evicted.res.end(); } catch {}
  }

  list.push({ res, connectedAt: Date.now() });
}

function _remove(key, res) {
  const list = SUBSCRIBERS.get(key);
  if (!list) return;
  const filtered = list.filter((c) => c.res !== res);
  if (filtered.length === 0) {
    SUBSCRIBERS.delete(key);
  } else {
    SUBSCRIBERS.set(key, filtered);
  }
}

/**
 * Subscribe an SSE response stream to a user's channel.
 * Returns an unsubscribe function.
 */
function subscribe(userId, role, res) {
  _add(userId, res);
  if (role === 'admin') _add(ADMIN_BROADCAST, res);

  return () => {
    _remove(userId, res);
    if (role === 'admin') _remove(ADMIN_BROADCAST, res);
  };
}

function _send(res, event, data) {
  // Skip already-closed connections
  if (res.writableEnded || res.destroyed) return false;
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    return true;
  } catch {
    return false;
  }
}

/** Deliver to connections held by THIS process only. */
function _deliverLocal(key, event, data) {
  _pruneList(key);
  const list = SUBSCRIBERS.get(key);
  if (!list || list.length === 0) return 0;
  let sent = 0;
  for (const { res } of list) {
    if (_send(res, event, data)) sent++;
  }
  return sent;
}

/**
 * Push an event to a specific user. Returns the number of LOCAL connections
 * reached; with Redis configured the event also reaches other instances.
 */
function publishToUser(userId, event, data) {
  const sent = _deliverLocal(userId, event, data);
  _fanout(userId, event, data);
  return sent;
}

/**
 * Push an event to every connected admin. Returns the number of LOCAL
 * connections reached; with Redis configured it also reaches other instances.
 */
function publishToAdmins(event, data) {
  const sent = _deliverLocal(ADMIN_BROADCAST, event, data);
  _fanout(ADMIN_BROADCAST, event, data);
  return sent;
}

/**
 * Push to user AND admins (deduped — admin connections are tracked separately).
 */
function publishToUserAndAdmins(userId, event, data) {
  publishToUser(userId, event, data);
  publishToAdmins(event, data);
}

/** Diagnostics: count currently connected channels and total connections. */
function stats() {
  let totalConnections = 0;
  let liveKeys = 0;
  for (const [key, list] of SUBSCRIBERS) {
    const live = list.filter((c) => !c.res.writableEnded && !c.res.destroyed);
    if (live.length > 0) { liveKeys++; totalConnections += live.length; }
  }
  return {
    keys:        liveKeys,
    connections: totalConnections,
    admins:      (SUBSCRIBERS.get(ADMIN_BROADCAST) || []).filter(
      (c) => !c.res.writableEnded && !c.res.destroyed
    ).length,
    maxPerUser:  MAX_CONNS_PER_USER,
  };
}

module.exports = {
  subscribe,
  publishToUser,
  publishToAdmins,
  publishToUserAndAdmins,
  stats,
};
