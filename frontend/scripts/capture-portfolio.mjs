// Captures full-size homepage screenshots of the portfolio projects for the
// cinematic gallery (desktop 1920px wide + phone), as WebP, into
// public/images/portfolio/hd. Run by .github/workflows/capture-portfolio.yml.
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.cwd(), 'public/images/portfolio/hd');
const SITES = [
  ['transo',      'https://transomaroc.vercel.app'],
  ['lueur-skin',  'https://lueurskin.vercel.app/'],
  ['vitacore',    'https://vitapara.vercel.app/fr'],
  ['emll',        'https://emll.vercel.app/'],
  ['chronocraft', 'https://watchstoremaroc.vercel.app'],
  ['tarique',     'https://www.tarique.ma'],
  ['riadconnect', 'https://riadconnect.vercel.app/'],
];
const VIEWS = [
  { suffix: '',        viewport: { width: 1440, height: 900 }, scale: 1.5, mobile: false, width: 1920, quality: 84 },
  { suffix: '-mobile', viewport: { width: 390,  height: 844 }, scale: 3,   mobile: true,  width: 585,  quality: 82 },
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
let failures = 0;
for (const [key, url] of SITES) {
  for (const v of VIEWS) {
    const ctx = await browser.newContext({ viewport: v.viewport, deviceScaleFactor: v.scale, isMobile: v.mobile, hasTouch: v.mobile });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(4000); // let hero animations settle
      const png = await page.screenshot();
      const file = path.join(OUT, `${key}${v.suffix}.webp`);
      await sharp(png).resize(v.width).webp({ quality: v.quality }).toFile(file);
      console.log('saved', path.relative(process.cwd(), file));
    } catch (e) {
      failures++;
      console.error('FAILED', key, v.suffix, e.message);
    }
    await ctx.close();
  }
}
await browser.close();
process.exit(failures ? 1 : 0);
