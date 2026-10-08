// Captures the real MBN Menu screens used by menu.html into assets/menu/.
// Guest side: the live demo at /m/demo (390 × 844 @2x). Owner side: the Live orders
// tab of a real restaurant (1024 × 720 @2x) — place a few orders first so it isn't empty.
//
// Usage (frontend dev server on :3100, backend on :5000):
//   node menu-shots.cjs [--base http://localhost:3100] [--restaurant <id>] [--email admin@mbndev.com --password …]
// The QR code is generated separately:
//   node -e "require('qrcode').toFile('assets/menu/qr-demo.png','https://mbndev.ma/m/demo',{width:640,margin:1})"
const { chromium } = require('playwright-core');
const { mkdirSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const BASE = args.base || 'http://localhost:3100';
const OUT = resolve(__dirname, 'assets/menu');
mkdirSync(OUT, { recursive: true });
const executablePath = process.env.CHROME_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const HIDE_DEV_BADGE = 'nextjs-portal{display:none!important}';

(async () => {
  const browser = await chromium.launch({ executablePath });

  // ── Guest screens ──────────────────────────────────────────────────────────
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const shot = async (name) => { await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/${name}.png` }); console.log('✓', name); };
  const open = async () => {
    await p.goto(`${BASE}/m/demo?t=7`, { waitUntil: 'networkidle', timeout: 300000 });
    await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await p.reload({ waitUntil: 'networkidle' });
    await p.addStyleTag({ content: HIDE_DEV_BADGE });
    await p.waitForTimeout(1000);
  };
  // First section heading right under the sticky search/category bar.
  const toList = async () => {
    await p.evaluate(() => {
      const el = document.querySelector('[data-cat]');
      const bar = [...document.querySelectorAll('*')].find((e) => getComputedStyle(e).position === 'sticky' && e.querySelector('input[type=search]'));
      const go = () => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - (bar ? bar.getBoundingClientRect().height : 140) - 4);
      go(); go();
    });
    await p.waitForTimeout(600);
  };
  const close = async () => { const c = p.getByRole('button', { name: 'Close' }).first(); if (await c.isVisible().catch(() => false)) await c.click(); };

  await open();
  await shot('01_home');
  await toList(); await shot('03_en');
  for (const [name, code] of [['Français', 'fr'], ['Español', 'es'], ['Português', 'pt'], ['Italiano', 'it']]) {
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.locator('button').filter({ hasText: /^(EN|FR|ES|PT|IT|DE)$/ }).first().click(); await p.waitForTimeout(500);
    if (code === 'fr') await shot('02_langsheet');
    await p.getByText(name, { exact: true }).click(); await p.waitForTimeout(700);
    await close();
    await toList(); await shot(`03_${code}`);
  }

  await open();
  await p.getByRole('button', { name: 'Filters' }).click(); await p.waitForTimeout(600);
  await shot('04_filters');
  await p.getByRole('button', { name: '1 Gluten' }).click(); await shot('04b1_gluten');
  await p.getByRole('button', { name: '2 Crustaceans' }).click(); await shot('04b2_crust');
  await p.getByRole('button', { name: '7 Milk' }).click(); await shot('04b_filters_on');
  await p.getByRole('button', { name: /^Show dishes/ }).click(); await p.waitForTimeout(600);
  await toList(); await shot('05_filtered');

  await open();
  await toList();
  await p.getByRole('button', { name: /^Galician octopus/ }).first().click(); await p.waitForTimeout(700);
  await shot('06_dish');
  await p.getByRole('button', { name: '+' }).click(); await shot('06b_dish_qty2');
  await p.getByRole('button', { name: /^Add/ }).click(); await p.waitForTimeout(500); await shot('06c_added');
  await p.getByRole('button', { name: /^Burrata & tomatoes/ }).last().click(); await p.waitForTimeout(700);
  await p.getByRole('button', { name: /^Add/ }).click(); await p.waitForTimeout(900);
  await p.getByRole('button', { name: /^Order/ }).last().click(); await p.waitForTimeout(900);
  await shot('07_cart');
  await p.getByRole('button', { name: /^Send to the kitchen/ }).click(); await p.waitForTimeout(1200);
  await shot('08_sent');
  await ctx.close();

  // ── Owner: Live orders (needs a signed-in owner and a restaurant with orders) ──
  if (args.restaurant) {
    const login = await (await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: args.email || 'admin@mbndev.com', password: args.password }) })).json();
    if (!login.token) throw new Error(`login failed: ${login.message}`);
    const octx = await browser.newContext({ viewport: { width: 1024, height: 720 }, deviceScaleFactor: 2 });
    await octx.addCookies([{ name: 'mbndev_auth', value: login.user.role, url: BASE }]);
    await octx.addInitScript(([t, u]) => { localStorage.setItem('mbndev_token', t); localStorage.setItem('mbndev_user', u); localStorage.setItem('mbndev_seen_version', '9.9.9'); }, [login.token, JSON.stringify(login.user)]);
    const o = await octx.newPage();
    await o.goto(`${BASE}/menu/r/${args.restaurant}?tab=live`, { waitUntil: 'networkidle', timeout: 300000 });
    await o.addStyleTag({ content: HIDE_DEV_BADGE });
    await o.waitForTimeout(2500);
    await o.screenshot({ path: `${OUT}/09_kitchen_1024.png` }); console.log('✓ 09_kitchen_1024');
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
