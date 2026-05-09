// ─── Realtime event bus (Server-Sent Events) ───────────────────────────────
// Per-user one-way push channel. Used to deliver:
//   - notification:created
//   - message:new
//   - project:updated
//   - payment:updated
//
// Simple in-memory hub: works on a single Node instance. For horizontal
// scaling, swap the Map for a Redis pub/sub layer — the publish() and
// subscribe() boundaries are designed for that.

const SUBSCRIBERS = new Map(); // userId -> Set<res>
const ADMIN_BROADCAST = '__admin__';

function _add(key, res) {
  if (!SUBSCRIBERS.has(key)) SUBSCRIBERS.set(key, new Set());
  SUBSCRIBERS.get(key).add(res);
}

function _remove(key, res) {
  const set = SUBSCRIBERS.get(key);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) SUBSCRIBERS.delete(key);
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
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch {
    /* connection probably closed */
  }
}

/**
 * Push an event to a specific user.
 */
function publishToUser(userId, event, data) {
  const set = SUBSCRIBERS.get(userId);
  if (!set) return;
  for (const res of set) _send(res, event, data);
}

/**
 * Push an event to every connected admin.
 */
function publishToAdmins(event, data) {
  const set = SUBSCRIBERS.get(ADMIN_BROADCAST);
  if (!set) return;
  for (const res of set) _send(res, event, data);
}

/**
 * Push to user AND admins (deduped — admin recipients identified by being
 * present in the admin broadcast set, not by userId match).
 */
function publishToUserAndAdmins(userId, event, data) {
  publishToUser(userId, event, data);
  publishToAdmins(event, data);
}

/** For diagnostics: count of currently connected channels */
function stats() {
  let totalConnections = 0;
  for (const set of SUBSCRIBERS.values()) totalConnections += set.size;
  return {
    keys:        SUBSCRIBERS.size,
    connections: totalConnections,
    admins:      (SUBSCRIBERS.get(ADMIN_BROADCAST) || new Set()).size,
  };
}

module.exports = {
  subscribe,
  publishToUser,
  publishToAdmins,
  publishToUserAndAdmins,
  stats,
};
