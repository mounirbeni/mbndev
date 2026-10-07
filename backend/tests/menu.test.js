const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  cleanMenu, cleanRestaurantPatch, cleanHours, priceOrder, cleanBooking, slotsFor, photoIdsIn, tableLabel, MenuError,
} = require('../src/lib/menu/validate');
const { decodePhoto } = require('../src/lib/menu/photo');
const { translateRestaurant, collect } = require('../src/lib/menu/translate');
const { sampleRestaurant } = require('../src/lib/menu/sample');

const dish = (over = {}) => ({ id: 'd1', name: { en: 'Pad Thai' }, price: 12.9, allergens: [5, 3, 3, 99], options: [{ id: 'o1', name: { en: 'Chicken' }, price: 0 }, { id: 'o2', name: { en: 'Prawns' }, price: 2.5 }], extras: [{ id: 'e1', name: { en: 'Egg' }, price: 1.5 }], ...over });
const menu = () => cleanMenu({ categories: [{ id: 'c1', name: { en: 'Mains' }, items: [dish(), dish({ id: 'd2', name: { en: 'Rice' }, price: 2.5, options: [], extras: [] })] }] });

test('cleanMenu keeps supported languages, de-duplicates allergens and drops nameless dishes', () => {
  const m = cleanMenu({ categories: [{ id: 'c1', name: { en: 'Mains', xx: 'nope' }, items: [dish(), { id: 'bad', name: {}, price: 3 }, dish({ id: 'd1', desc: { en: '  hot\n\n\n\nand sour ' } })] }] });
  const items = m.categories[0].items;
  assert.equal(items.length, 2);
  assert.deepEqual(items[0].allergens, [3, 5]);
  assert.deepEqual(m.categories[0].name, { en: 'Mains' });
  assert.notEqual(items[0].id, items[1].id, 'duplicate ids get a fresh one');
  assert.equal(items[1].desc.en, 'hot\n\nand sour');
  assert.equal(items[0].vegan, false);
  assert.equal(items[0].available, true);
});

test('cleanMenu: vegan implies vegetarian, spicy is clamped, negative price becomes 0', () => {
  const it = cleanMenu({ categories: [{ name: { en: 'X' }, items: [dish({ vegan: true, spicy: 9, price: -4 })] }] }).categories[0].items[0];
  assert.equal(it.veg, true);
  assert.equal(it.spicy, 3);
  assert.equal(it.price, 0);
});

test('priceOrder recomputes the total from the saved menu, ignoring client prices', () => {
  const { items, total } = priceOrder(menu(), [
    { itemId: 'd1', optionId: 'o2', extraIds: ['e1', 'e1'], qty: 2, price: 0.01 },
    { itemId: 'd2', qty: 1 },
  ]);
  assert.equal(items[0].unit, 12.9 + 2.5 + 1.5);
  assert.equal(total, Math.round(((12.9 + 2.5 + 1.5) * 2 + 2.5) * 100) / 100);
  assert.equal(items[0].extras.length, 1);
});

test('priceOrder rejects unknown dishes, sold-out dishes and silly quantities', () => {
  assert.throws(() => priceOrder(menu(), [{ itemId: 'nope', qty: 1 }]), MenuError);
  assert.throws(() => priceOrder(menu(), [{ itemId: 'd1', qty: 0 }]), MenuError);
  assert.throws(() => priceOrder(menu(), [{ itemId: 'd1', qty: 500 }]), MenuError);
  assert.throws(() => priceOrder(menu(), []), MenuError);
  const m = menu(); m.categories[0].items[0].available = false;
  assert.throws(() => priceOrder(m, [{ itemId: 'd1', qty: 1 }]), MenuError);
});

test('cleanRestaurantPatch validates contact fields, languages and colour', () => {
  const data = cleanRestaurantPatch({ name: '  Thai  Garden ', languages: ['pt', 'xx', 'en'], defaultLanguage: 'en', color: '#1F4FD1', instagram: '@thai.garden', phone: '+351 220 995 072', payments: ['card', 'bitcoin'] }, {});
  assert.equal(data.name, 'Thai Garden');
  assert.deepEqual(data.languages, ['pt', 'en']);
  assert.equal(data.defaultLanguage, 'en');
  assert.equal(data.color, '#1f4fd1');
  assert.equal(data.instagram, 'thai.garden');
  assert.deepEqual(data.payments, ['card']);
  assert.throws(() => cleanRestaurantPatch({ website: 'javascript:alert(1)' }, {}), MenuError);
  assert.throws(() => cleanRestaurantPatch({ languages: [] }, {}), MenuError);
  assert.throws(() => cleanRestaurantPatch({ timezone: 'Mars/Base' }, {}), MenuError);
  assert.equal(cleanRestaurantPatch({ defaultLanguage: 'fr' }, { languages: ['en'] }).defaultLanguage, 'en');
});

test('cleanHours keeps valid ranges, allows closing after midnight and sorts them', () => {
  const h = cleanHours({ 1: [[1140, 1500], [720, 900], [900, 800], ['a', 3]], 7: [[1, 2]] });
  assert.deepEqual(h[1], [[720, 900], [1140, 1500]]);
  assert.deepEqual(h[0], []);
  assert.equal(h[7], undefined);
});

test('booking slots follow opening hours and cleanBooking enforces them', () => {
  const r = { timezone: 'Europe/Lisbon', hours: cleanHours({ 3: [[720, 900]] }) };
  assert.deepEqual(slotsFor(r.hours, 3), [720, 750, 780, 810, 840]);
  const now = new Date('2026-10-05T09:00:00Z'); // Monday
  assert.deepEqual(cleanBooking({ date: '2026-10-07', time: '13:00', guests: 2 }, r, now), { date: '2026-10-07', time: '13:00', guests: 2 });
  assert.throws(() => cleanBooking({ date: '2026-10-07', time: '14:30', guests: 2 }, r, now), MenuError, 'too close to closing');
  assert.throws(() => cleanBooking({ date: '2026-10-06', time: '13:00', guests: 2 }, r, now), MenuError, 'closed day');
  assert.throws(() => cleanBooking({ date: '2026-10-04', time: '13:00', guests: 2 }, r, now), MenuError, 'in the past');
  assert.throws(() => cleanBooking({ date: '2026-10-07', time: '13:00', guests: 0 }, r, now), MenuError);
});

test('tableLabel strips markup and keeps short labels', () => {
  assert.equal(tableLabel('12'), '12');
  assert.equal(tableLabel('<b>T4</b>'), 'bT4b');
  assert.equal(tableLabel(''), null);
});

test('decodePhoto trusts the bytes, not the label', () => {
  const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 '), Buffer.alloc(20)]);
  assert.equal(decodePhoto(`data:image/webp;base64,${webp.toString('base64')}`).mime, 'image/webp');
  assert.ok(decodePhoto(`data:image/png;base64,${Buffer.from('<svg onload=alert(1)>').toString('base64')}`).error);
  assert.ok(decodePhoto('data:image/svg+xml;base64,PHN2Zz4=').error);
  assert.ok(decodePhoto(`data:image/jpeg;base64,${Buffer.alloc(200 * 1024, 0xff).toString('base64')}`).error);
});

test('photoIdsIn lists logo, cover and dish photos', () => {
  const ids = photoIdsIn({ logoPhotoId: 'logo1234567', menu: { categories: [{ items: [{ photo: 'dish1234567' }, { photo: null }] }] } });
  assert.deepEqual([...ids].sort(), ['dish1234567', 'logo1234567']);
});

test('translateRestaurant fills only missing text and never overwrites the owner', async () => {
  const restaurant = { name: 'R', tagline: { en: 'Fresh food', fr: 'Déjà écrit' }, about: {}, menu: menu() };
  restaurant.menu.categories[0].items[0].name.fr = 'Pad Thaï maison';
  const seen = [];
  const fetchImpl = async (_url, opts) => {
    const strings = JSON.parse(JSON.parse(opts.body).messages[1].content);
    seen.push(strings);
    const out = Object.fromEntries(Object.entries(strings).map(([k, v]) => [k, `FR:${v}`]));
    return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(out) } }] }) };
  };
  const res = await translateRestaurant({ apiKey: 'sk-test', restaurant, from: 'en', to: 'fr', fetchImpl });
  assert.equal(restaurant.tagline.fr, 'Déjà écrit');
  assert.equal(restaurant.menu.categories[0].items[0].name.fr, 'Pad Thaï maison');
  assert.equal(restaurant.menu.categories[0].items[1].name.fr, 'FR:Rice');
  assert.equal(restaurant.menu.categories[0].name.fr, 'FR:Mains');
  assert.equal(res.remaining, 0);
  assert.ok(res.translated >= 4);
  assert.equal(collect(restaurant, 'en', ['fr']).length, 0);
});

test('the sample restaurant passes validation and keeps every dish', () => {
  const data = cleanRestaurantPatch(sampleRestaurant(), {});
  const dishes = data.menu.categories.reduce((n, c) => n + c.items.length, 0);
  assert.equal(dishes, 24);
  assert.deepEqual(data.languages, ['pt', 'en', 'es', 'fr', 'it']);
  assert.ok(data.menu.categories.every((c) => c.name.pt && c.name.en));
});
