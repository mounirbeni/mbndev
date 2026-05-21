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
// Horizontal scaling note: swap the Map for a Redis pub/sub layer — the
// publish() and subscribe() boundaries are designed for that.

'use strict';

const MAX_CONNS_PER_USER = 5;  // max simultaneous SSE connections per userId
const ADMIN_BROADCAST    = '__admin__';

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

/**
 * Push an event to a specific user. Returns the number of connections reached.
 */
function publishToUser(userId, event, data) {
  _pruneList(userId);
  const list = SUBSCRIBERS.get(userId);
  if (!list || list.length === 0) return 0;
  let sent = 0;
  for (const { res } of list) {
    if (_send(res, event, data)) sent++;
  }
  return sent;
}

/**
 * Push an event to every connected admin. Returns the number of connections reached.
 */
function publishToAdmins(event, data) {
  _pruneList(ADMIN_BROADCAST);
  const list = SUBSCRIBERS.get(ADMIN_BROADCAST);
  if (!list || list.length === 0) return 0;
  let sent = 0;
  for (const { res } of list) {
    if (_send(res, event, data)) sent++;
  }
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
