const { test } = require('node:test');
const assert   = require('node:assert');
const realtime = require('../src/lib/realtime');

function fakeRes() {
  return {
    chunks:        [],
    writableEnded: false,
    destroyed:     false,
    write(chunk)  { this.chunks.push(chunk); return true; },
    end()         { this.writableEnded = true; },
  };
}

test('publishToUser reaches a subscribed connection', () => {
  const res   = fakeRes();
  const unsub = realtime.subscribe('user-1', 'client', res);

  const sent = realtime.publishToUser('user-1', 'message:new', { id: 'm1' });

  assert.equal(sent, 1);
  const payload = res.chunks.join('');
  assert.match(payload, /event: message:new/);
  assert.match(payload, /"id":"m1"/);
  unsub();
});

test('admin connections receive admin broadcasts', () => {
  const res   = fakeRes();
  const unsub = realtime.subscribe('admin-1', 'admin', res);

  assert.equal(realtime.publishToAdmins('notification:new', { n: 1 }), 1);
  unsub();
});

test('client connections do NOT receive admin broadcasts', () => {
  const res   = fakeRes();
  const unsub = realtime.subscribe('user-9', 'client', res);

  realtime.publishToAdmins('notification:new', { n: 1 });

  assert.equal(res.chunks.length, 0);
  unsub();
});

test('unsubscribe stops delivery', () => {
  const res   = fakeRes();
  const unsub = realtime.subscribe('user-2', 'client', res);
  unsub();

  assert.equal(realtime.publishToUser('user-2', 'x', {}), 0);
});

test('per-user connection limit evicts the oldest connection', () => {
  const conns  = Array.from({ length: 7 }, fakeRes);
  const unsubs = conns.map((r) => realtime.subscribe('user-3', 'client', r));

  // Limit is 5 — only the 5 newest connections receive the event
  assert.equal(realtime.publishToUser('user-3', 'x', {}), 5);
  assert.equal(conns[0].writableEnded, true);
  assert.equal(conns[1].writableEnded, true);

  unsubs.forEach((u) => u());
});

test('closed connections are pruned, not counted', () => {
  const res   = fakeRes();
  const unsub = realtime.subscribe('user-4', 'client', res);
  res.writableEnded = true;

  assert.equal(realtime.publishToUser('user-4', 'x', {}), 0);
  unsub();
});
