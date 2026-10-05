/**
 * Shared rate-limit store for express-rate-limit.
 *
 * The default MemoryStore counts per process. On Vercel each serverless
 * instance has its own memory, so an attacker spreading requests across
 * instances gets N× the configured limit. When REDIS_URL is set, counters
 * live in Redis and are shared by every instance.
 *
 * Redis failures never take the API down: the store falls back to an
 * in-process MemoryStore (the previous behaviour) until Redis answers again.
 */
const { MemoryStore } = require('express-rate-limit');

// INCR + set the window expiry on the first hit, atomically.
const INCREMENT_SCRIPT = `
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { hits, ttl }
`;

let sharedClient = null;
function getClient() {
  if (sharedClient !== null) return sharedClient;
  const url = process.env.REDIS_URL;
  if (!url) return (sharedClient = undefined);
  try {
    const Redis = require('ioredis');
    sharedClient = new Redis(url, { maxRetriesPerRequest: 1, connectTimeout: 3000 });
    sharedClient.on('error', (err) => console.warn('[rate-limit] Redis error:', err.message));
  } catch (err) {
    console.warn('[rate-limit] Redis init failed, using in-memory limits:', err.message);
    sharedClient = undefined;
  }
  return sharedClient;
}

class RedisRateLimitStore {
  constructor(prefix, client) {
    this.prefix = `rl:${prefix}:`;
    this.client = client;
    this.fallback = new MemoryStore();
    this.localKeys = false;
  }

  init(options) {
    this.windowMs = options.windowMs;
    this.fallback.init(options);
  }

  async increment(key) {
    try {
      const [hits, ttl] = await this.client.eval(INCREMENT_SCRIPT, 1, this.prefix + key, this.windowMs);
      return { totalHits: Number(hits), resetTime: new Date(Date.now() + Number(ttl)) };
    } catch {
      return this.fallback.increment(key);
    }
  }

  async decrement(key) {
    try {
      await this.client.decr(this.prefix + key);
    } catch {
      await this.fallback.decrement(key);
    }
  }

  async resetKey(key) {
    try {
      await this.client.del(this.prefix + key);
    } catch {
      /* best effort */
    }
    await this.fallback.resetKey(key);
  }

  shutdown() {
    this.fallback.shutdown();
  }
}

/**
 * Returns a store for one limiter (each limiter needs its own instance and
 * prefix), or undefined to use express-rate-limit's default MemoryStore
 * when Redis isn't configured.
 */
function createRateLimitStore(prefix, client = getClient()) {
  return client ? new RedisRateLimitStore(prefix, client) : undefined;
}

module.exports = { createRateLimitStore, RedisRateLimitStore };
