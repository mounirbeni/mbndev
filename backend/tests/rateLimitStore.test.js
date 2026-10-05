const { test } = require('node:test');
const assert   = require('node:assert');
const { createRateLimitStore, RedisRateLimitStore } = require('../src/lib/rateLimitStore');

// Minimal in-memory stand-in for the ioredis calls the store makes.
function fakeRedis() {
  const data = new Map();
  return {
    data,
    async eval(_script, _n, key, windowMs) {
      const hits = (data.get(key) || 0) + 1;
      data.set(key, hits);
      return [hits, windowMs];
    },
    async decr(key) { data.set(key, (data.get(key) || 0) - 1); },
    async del(key) { data.delete(key); },
  };
}

test('createRateLimitStore returns undefined without a Redis client', () => {
  assert.equal(createRateLimitStore('auth', undefined), undefined);
});

test('counts hits in Redis under a per-limiter prefix', async () => {
  const redis = fakeRedis();
  const store = createRateLimitStore('auth', redis);
  store.init({ windowMs: 60000 });
  await store.increment('1.2.3.4');
  const { totalHits, resetTime } = await store.increment('1.2.3.4');
  assert.equal(totalHits, 2);
  assert.ok(resetTime instanceof Date);
  assert.equal(redis.data.get('rl:auth:1.2.3.4'), 2);
  await store.decrement('1.2.3.4');
  assert.equal(redis.data.get('rl:auth:1.2.3.4'), 1);
  await store.resetKey('1.2.3.4');
  assert.equal(redis.data.has('rl:auth:1.2.3.4'), false);
  store.shutdown();
});

test('falls back to in-memory counting when Redis fails', async () => {
  const broken = { eval: async () => { throw new Error('down'); }, decr: async () => {}, del: async () => {} };
  const store = new RedisRateLimitStore('api', broken);
  store.init({ windowMs: 60000 });
  await store.increment('k');
  const { totalHits } = await store.increment('k');
  assert.equal(totalHits, 2);
  store.shutdown();
});
