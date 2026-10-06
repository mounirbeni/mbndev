const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeContent, normalizeItems, totalOf } = require('../src/lib/proposalAi/shape');
const { generateProposal } = require('../src/lib/proposalAi/generate');

test('normalizeItems cleans prices, ids and drops empty rows', () => {
  const items = normalizeItems([
    { id: 'abc123', name: 'Website design', price: '1200.555', optional: 0 },
    { name: 'SEO setup', price: -50, optional: true },
    { name: '', price: 99 },
    { id: 'bad id!', name: 'Hosting', price: 1e12 },
  ]);
  assert.equal(items.length, 3);
  assert.deepEqual(items[0], { id: 'abc123', name: 'Website design', description: '', price: 1200.56, optional: false });
  assert.equal(items[1].price, 0);
  assert.equal(items[1].optional, true);
  assert.match(items[2].id, /^[a-f0-9]{12}$/);
  assert.equal(items[2].price, 10_000_000);
});

test('totalOf counts required items and only the selected optional ones', () => {
  const items = [
    { id: 'a', price: 1000, optional: false },
    { id: 'b', price: 300, optional: true },
    { id: 'c', price: 200, optional: true },
  ];
  assert.equal(totalOf(items), 1000);
  assert.equal(totalOf(items, ['b']), 1300);
  assert.equal(totalOf(items, ['a', 'b', 'c']), 1500);
});

test('normalizeContent keeps known sections and bounded phases', () => {
  const c = normalizeContent({ intro: ' Hi ', phases: [{ title: 'Discovery', duration: '1 week' }, {}], extra: 'x' });
  assert.deepEqual(c, { intro: 'Hi', solution: '', phases: [{ title: 'Discovery', description: '', duration: '1 week' }], terms: '' });
});

test('generateProposal parses the AI JSON and rejects incomplete answers', async () => {
  const reply = (obj) => async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(obj) } }] }) });
  const out = await generateProposal({
    apiKey: 'sk-x', brief: 'New website for a riad', clientName: 'Riad Yasmine', language: 'fr', currency: 'EUR',
    fetchImpl: reply({ title: 'Nouveau site', intro: 'Vous souhaitez…', solution: 'Un site…', phases: [{ title: 'Design', duration: '1 semaine' }], items: [{ name: 'Design', price: 900 }, { name: 'Blog', price: 200, optional: true }], terms: '50% à la commande' }),
  });
  assert.equal(out.title, 'Nouveau site');
  assert.equal(out.items.length, 2);
  assert.equal(out.items[1].optional, true);
  await assert.rejects(generateProposal({ apiKey: 'sk-x', brief: 'x', clientName: 'A', fetchImpl: reply({ intro: '', items: [] }) }), /incomplete/);
  await assert.rejects(generateProposal({ apiKey: 'sk-x', brief: 'x', clientName: 'A', fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: 'not json' } }] }) }) }), /unreadable/);
});
