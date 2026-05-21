'use strict';

// ─── Lightweight in-process TTL cache ────────────────────────────────────────
// Not a replacement for Redis — this is for hot-path data that's:
//   • Small (fits comfortably in a single Node process)
//   • Cheap to recompute on cold starts / deploys
//   • Read far more often than written
//
// For Vercel serverless: each cold start begins empty. That's fine — the cache
// warms up within the first few requests and lives for the lifetime of the
// function instance (typically minutes to hours).
//
// API:
//   get(key)                  → value or undefined
//   set(key, value, ttlMs)    → value
//   del(key)                  → void
//   getOrSet(key, fn, ttlMs)  → Promise<value>
//   clear()                   → void
//   size()                    → number of live entries

const store = new Map(); // key → { value, expiresAt }

/** Internal: remove expired entries (called lazily on reads). */
function _isExpired(entry) {
  return entry.expiresAt !== null && Date.now() > entry.expiresAt;
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (_isExpired(entry)) { store.delete(key); return undefined; }
  return entry.value;
}

function set(key, value, ttlMs = 60_000) {
  store.set(key, {
    value,
    expiresAt: ttlMs === Infinity ? null : Date.now() + ttlMs,
  });
  return value;
}

function del(key) {
  store.delete(key);
}

/**
 * Return cached value if fresh; otherwise call `fn`, cache the result, and
 * return it. Concurrent callers that arrive while `fn` is in-flight will
 * each independently call `fn` (no stampede protection needed at this scale).
 */
async function getOrSet(key, fn, ttlMs = 60_000) {
  const cached = get(key);
  if (cached !== undefined) return cached;
  const value = await fn();
  return set(key, value, ttlMs);
}

function clear() {
  store.clear();
}

function size() {
  // Prune expired before counting
  for (const [k, v] of store) {
    if (_isExpired(v)) store.delete(k);
  }
  return store.size;
}

// Periodic cleanup every 5 min to avoid unbounded growth in long-lived instances
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let _cleanupTimer = null;

function startCleanup() {
  if (_cleanupTimer) return;
  _cleanupTimer = setInterval(() => {
    for (const [k, v] of store) {
      if (_isExpired(v)) store.delete(k);
    }
  }, CLEANUP_INTERVAL);
  // Don't prevent process exit
  if (_cleanupTimer.unref) _cleanupTimer.unref();
}

startCleanup();

// ─── Named cache keys ─────────────────────────────────────────────────────────
const KEYS = Object.freeze({
  ADMIN_IDS:    'admin_ids',
  PACKAGES:     'packages',
  ANALYTICS:    'admin_analytics',
  NOTIF_UNREAD: (userId) => `notif_unread:${userId}`,
});

// Admin IDs TTL: 2 minutes (admins are rarely added/removed)
const ADMIN_IDS_TTL = 2 * 60 * 1000;

module.exports = { get, set, del, getOrSet, clear, size, KEYS, ADMIN_IDS_TTL };
