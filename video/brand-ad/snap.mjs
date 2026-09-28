// Exports every `.slide` element of a page as a PNG (carousels, reel covers).
// Usage: node snap.mjs --page carousel.html [--data data/x.json] [--out out/carousel]
//        → out/carousel-01.png, out/carousel-02.png, …
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []),
);
const pageFile = args.page ?? 'carousel.html';
const dataFile = args.data ? resolve(process.cwd(), args.data) : null;
const dataName = dataFile ? '-' + dataFile.split('/').pop().replace(/\.json$/, '') : '';
const outPrefix = resolve(here, args.out ?? `out/${pageFile.replace(/\.html$/, '')}${dataName}`);
mkdirSync(dirname(outPrefix), { recursive: true });

// Official transparent monogram (never redrawn): decoded from the encoded source.
mkdirSync(resolve(here, 'assets'), { recursive: true });
const b64 = readFileSync(resolve(here, '../../frontend/branding/approved-icon.webp.b64'), 'utf8').trim();
writeFileSync(resolve(here, 'assets/brand-icon-transparent.webp'), Buffer.from(b64, 'base64'));

const executablePath = process.env.CHROME_PATH || (existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
if (dataFile) await page.addInitScript(`window.__DATA = ${readFileSync(dataFile, 'utf8')};`);
await page.goto(pathToFileURL(resolve(here, pageFile)).href);
await page.evaluate(() => window.__ready);

const slides = page.locator('.slide');
const n = await slides.count();
for (let i = 0; i < n; i++) {
  const file = `${outPrefix}-${String(i + 1).padStart(2, '0')}.png`;
  await slides.nth(i).screenshot({ path: file });
  console.log(`Wrote ${file}`);
}
await browser.close();
