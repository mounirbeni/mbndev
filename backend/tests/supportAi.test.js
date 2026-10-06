const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-secret';
const { extractPage, chunkText, rankChunks, crawlSite } = require('../src/lib/supportAi/knowledge');
const { answerVisitor } = require('../src/lib/supportAi/answer');
const { originAllowed } = require('../src/lib/supportAi/origin');

const lookup = async () => [{ address: '93.184.216.34' }];

test('extractPage keeps content, drops scripts/nav, finds same-site links', () => {
  const html = `<html><head><title>Riad &amp; Spa</title><script>var x=1</script></head><body>
    <nav><a href="/menu">Menu</a></nav>
    <h1>Welcome</h1><p>Breakfast is served from 8:00 to 10:30.</p>
    <a href="/rooms">Rooms</a> <a href="https://other.com/x">x</a> <a href="/logo.png">img</a></body></html>`;
  const p = extractPage(html, 'https://riad.example/');
  assert.equal(p.title, 'Riad & Spa');
  assert.match(p.text, /Breakfast is served from 8:00 to 10:30/);
  assert.doesNotMatch(p.text, /var x/);
  assert.deepEqual(p.links, ['https://riad.example/menu', 'https://riad.example/rooms']);
});

test('chunkText splits long text without losing content', () => {
  const text = Array.from({ length: 60 }, (_, i) => `Line ${i} with some useful words about the riad.`).join('\n');
  const chunks = chunkText(text, 300);
  assert.ok(chunks.length > 5);
  assert.ok(chunks.every((c) => c.length <= 450));
  assert.equal(chunks.join('\n').split('\n').length, 60);
});

test('rankChunks finds the relevant chunk in English, French and Arabic', () => {
  const chunks = [
    { title: 'Rooms', text: 'Our suites have a private terrace and air conditioning.' },
    { title: 'Breakfast', text: 'Breakfast is served on the rooftop from 8 to 10:30. Le petit-déjeuner est servi sur la terrasse.' },
    { title: 'Transfer', text: 'Airport transfer costs 200 MAD. نقل من المطار بسعر 200 درهم' },
  ];
  assert.equal(rankChunks(chunks, 'When is breakfast?')[0].title, 'Breakfast');
  assert.equal(rankChunks(chunks, 'petit dejeuner horaires')[0].title, 'Breakfast');
  assert.equal(rankChunks(chunks, 'كم سعر النقل من المطار')[0].title, 'Transfer');
  assert.deepEqual(rankChunks(chunks, 'the and of'), []);
});

test('crawlSite follows the sitemap and links, stays on the site', async () => {
  const pages = {
    'https://riad.example/sitemap.xml': '<urlset><url><loc>https://riad.example/rooms</loc></url><url><loc>https://evil.example/x</loc></url></urlset>',
    'https://riad.example/': '<html><body><p>Welcome to Riad Example, a quiet riad in the medina with six rooms.</p><a href="/contact">c</a></body></html>',
    'https://riad.example/rooms': '<html><body><p>Six rooms around a courtyard with a fountain and orange trees, all with private bathrooms.</p></body></html>',
    'https://riad.example/contact': '<html><body><p>Contact us on WhatsApp at any time, we reply within one hour during the day.</p></body></html>',
  };
  const fetchImpl = async (url) => (pages[url] ? new Response(pages[url], { status: 200 }) : new Response('nope', { status: 404 }));
  const out = await crawlSite('riad.example', { fetchOpts: { fetchImpl, lookup } });
  assert.deepEqual(out.map((p) => p.url).sort(), ['https://riad.example/', 'https://riad.example/contact', 'https://riad.example/rooms']);
});

test('answerVisitor strips the [LEAD] tag and reports it', async () => {
  const fetchImpl = async (_url, init) => {
    const body = JSON.parse(init.body);
    assert.match(body.messages[0].content, /ONLY the information in CONTEXT/);
    assert.match(body.messages[0].content, /Breakfast/);
    return new Response(JSON.stringify({ choices: [{ message: { content: 'Happy to book it for you! [LEAD]' } }] }), { status: 200 });
  };
  const out = await answerVisitor({
    apiKey: 'sk-x', bot: { name: 'Riad', websiteUrl: 'https://riad.example' },
    chunks: [{ title: 'Breakfast', text: 'Breakfast 8–10:30' }], message: 'Can I book a room?', fetchImpl,
  });
  assert.deepEqual(out, { reply: 'Happy to book it for you!', wantsLead: true });
});

test('originAllowed accepts the bot domains, subdomains and mbndev.ma only', () => {
  const bot = { allowedDomains: ['riad.example'] };
  assert.equal(originAllowed(bot, 'https://riad.example/page'), true);
  assert.equal(originAllowed(bot, 'https://www.riad.example'), true);
  assert.equal(originAllowed(bot, 'shop.riad.example'), true);
  assert.equal(originAllowed(bot, 'https://mbndev.ma/support-ai'), true);
  assert.equal(originAllowed(bot, 'https://evil.example'), false);
  assert.equal(originAllowed(bot, 'https://riad.example.evil.com'), false);
});
