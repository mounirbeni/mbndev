// Captures the extra MBN Menu screens used by menu-explainer.html into assets/menu/
// (menu-shots.cjs captures the ones shared with menu.html).
// Guest side: the live demo at /m/demo (390 × 844 @2x) — dish options/extras/note, order tracking
// (the demo advances an order to Preparing at 6 s and On its way at 14 s), waiter call, bill, booking.
// Owner side (needs --restaurant and a signed-in owner): Live orders (full page), the Menu editor
// (sold out, Edit dish) and the printable QR pages. Before capturing, place a Table 7 order
// (Rib-eye · Medium · Pepper sauce · note), a bill request and a booking on that restaurant.
//
// Usage (frontend dev server on :3100, backend on :5000):
//   node menu-explainer-shots.cjs [--base http://localhost:3100] [--restaurant <id> --password …] [--only order|bill|book|info|live|menu|qr]
// Then crop the white paper of 23_qr_cards.png / 23b_poster.png into *_crop.png.
const { chromium } = require('playwright-core');
const { mkdirSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const BASE = args.base || 'http://localhost:3100';
const R = args.restaurant;
const OUT = resolve(__dirname, 'assets/menu');
mkdirSync(OUT, { recursive: true });
const executablePath = process.env.CHROME_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const HIDE = 'nextjs-portal{display:none!important}';
const only = args.only || 'all';

(async () => {
  const b = await chromium.launch({ executablePath });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const shot = async (n, w = 800) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${n}.png` }); console.log('✓', n); };
  const open = async () => {
    await p.goto(`${BASE}/m/demo?t=7`, { waitUntil: 'networkidle', timeout: 300000 });
    await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await p.reload({ waitUntil: 'networkidle' });
    await p.addStyleTag({ content: HIDE });
    await p.waitForTimeout(1000);
  };
  const toCat = async (name) => {
    await p.evaluate((nm) => {
      const el = [...document.querySelectorAll('[data-cat]')].find((e) => e.textContent.includes(nm)) || document.querySelector('[data-cat]');
      const bar = [...document.querySelectorAll('*')].find((e) => getComputedStyle(e).position === 'sticky' && e.querySelector('input[type=search]'));
      const go = () => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - (bar ? bar.getBoundingClientRect().height : 140) - 4);
      go(); go();
    }, name);
    await p.waitForTimeout(600);
  };
  const tab = (n) => p.locator('nav[aria-label="Sections"] button').filter({ hasText: n }).click();

  await open();
  if (only === 'all' || only === 'order') {
    await toCat('Mains'); await shot('10_mains');
    await p.getByRole('button', { name: /^Rib-eye/ }).first().click(); await shot('10a_ribeye', 900);
   
    await p.getByText('Medium', { exact: true }).click(); await shot('10b_medium', 400);
    await p.getByText('Pepper sauce', { exact: true }).click(); await shot('10c_pepper', 400);
    const note = p.getByPlaceholder(/./).last();
    await note.scrollIntoViewIfNeeded(); await note.click(); await note.type('No salt on the fries, please', { delay: 20 });
    await p.keyboard.press('Tab').catch(() => {});
    await shot('10d_note', 500);
    await p.getByRole('button', { name: /^Add/ }).click(); await p.waitForTimeout(900);
    await tab('Order'); await p.waitForTimeout(800); await p.evaluate(() => window.scrollTo(0, 0));
    await shot('11_cart');
    await p.getByRole('button', { name: /^Send to the kitchen/ }).click();
    const t0 = Date.now();
    await shot('12_new', 1200);
    await p.waitForTimeout(Math.max(0, 7000 - (Date.now() - t0))); await shot('12_preparing', 300);
    await p.waitForTimeout(Math.max(0, 15000 - (Date.now() - t0))); await shot('12_ready', 300);
    // waiter + bill (buttons further down the order page)
    await p.getByRole('button', { name: /Call a waiter/ }).scrollIntoViewIfNeeded();
    await shot('13_actions', 500);
    await p.getByRole('button', { name: /Call a waiter/ }).click(); await shot('13_waiter', 500);
    await p.waitForTimeout(2600);
    await p.getByRole('button', { name: /Ask for the bill/ }).first().click(); await shot('14_billsheet', 700);
  }
  if (only === 'all' || only === 'bill') {
    await tab('Order'); await p.waitForTimeout(800);
    await p.getByRole('button', { name: /Ask for the bill/ }).first().click(); await p.waitForTimeout(700);
    await p.getByRole('button', { name: 'Card', exact: true }).click();
    await p.getByRole('button', { name: /Ask for the bill/ }).last().click(); await shot('14b_bill', 600);
  }
  if (only === 'all' || only === 'book') {
    await open();
    await tab('Book'); await p.waitForTimeout(900); await p.evaluate(() => window.scrollTo(0, 0));
    await shot('15_book');
    await p.evaluate(() => { const h = document.querySelector('form'); window.scrollTo(0, h.getBoundingClientRect().top + scrollY - 70); }); await p.waitForTimeout(500);
    await shot('15a_form');
    for (let i = 0; i < 2; i++) await p.locator('form button', { hasText: '+' }).first().click();
    await p.locator('form button').filter({ hasText: /^20:00$/ }).click(); await shot('15b_slot', 500);
    await p.locator('form input').nth(1).fill('Sophie Martin');
    await p.locator('form input[type=tel]').fill('+33 6 12 34 56 78');
    await p.locator('form input[type=checkbox]').check().catch(() => {});
    await p.locator('form button[type=submit]').scrollIntoViewIfNeeded(); await shot('15c_filled', 500);
    await p.locator('form button[type=submit]').click();
    const t0 = Date.now();
    await p.waitForTimeout(800); await p.evaluate(() => window.scrollTo(0, 0)); await p.evaluate(() => { const h = document.querySelector('h2'); window.scrollTo(0, h.getBoundingClientRect().top + scrollY - 20); });
    await shot('16_booked', 300);
    await p.waitForTimeout(Math.max(0, 7500 - (Date.now() - t0))); await shot('16b_confirmed', 300);
  }
  if (only === 'all' || only === 'info') {
    await open(); await tab('Info'); await p.waitForTimeout(800); await p.evaluate(() => { const h = document.querySelector('h2'); window.scrollTo(0, h.getBoundingClientRect().top + scrollY - 20); }); await shot('17_info');
  }

  // ── Owner screens ──────────────────────────────────────────────────────────
  if (R) {
    const login = await (await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: args.email || 'admin@mbndev.com', password: args.password }) })).json();
    if (!login.token) throw new Error(`login failed: ${login.message}`);
    const octx = await b.newContext({ viewport: { width: 1024, height: 720 }, deviceScaleFactor: 2 });
    await octx.addCookies([{ name: 'mbndev_auth', value: login.user.role, url: BASE }]);
    await octx.addInitScript(([t, u]) => { localStorage.setItem('mbndev_token', t); localStorage.setItem('mbndev_user', u); localStorage.setItem('mbndev_seen_version', '9.9.9'); }, [login.token, JSON.stringify(login.user)]);
    const o = await octx.newPage();
    const oshot = async (n, w = 1500) => { await o.waitForTimeout(w); await o.screenshot({ path: `${OUT}/${n}.png` }); console.log('✓', n); };
    const go = async (u) => { await o.goto(BASE + u, { waitUntil: 'networkidle', timeout: 300000 }); await o.addStyleTag({ content: 'nextjs-portal{display:none!important}' }); };
    if (only === 'all' || only === 'live') {
      await go(`/menu/r/${R}?tab=live`); await o.waitForTimeout(2500);
      await o.screenshot({ path: `${OUT}/20_live_full.png`, fullPage: true }); console.log('✓ 20_live_full');
    }
    if (only === 'all' || only === 'menu') {
      await go(`/menu/r/${R}?tab=menu`); await oshot('21_editor');
      await o.getByRole('button', { name: 'Mark sold out' }).nth(3).click(); await oshot('21b_soldout', 700);
      await o.getByRole('button', { name: 'Mark available' }).first().click(); await o.waitForTimeout(400);
      await o.getByRole('button', { name: 'Edit' }).nth(1).click(); await oshot('21c_dish', 1200);
    }
    if (only === 'all' || only === 'qr') { await go(`/m/${R}/qr?tables=6`); await oshot('23_qr_cards', 2500); await go(`/m/${R}/qr`); await oshot('23b_poster', 2500); }
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
