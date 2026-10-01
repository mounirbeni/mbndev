// Exports a template's sound + narration cues (window.__sfx / window.__vo) to JSON for sfx.py.
// Usage: node cues.mjs --page experience.html [--data data/x.json] --out out/experience-cues.json
import { chromium } from 'playwright-core';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []),
);
const pageFile = args.page ?? 'experience.html';
const out = resolve(here, args.out ?? `out/${pageFile.replace(/\.html$/, '')}-cues.json`);
const executablePath = process.env.CHROME_PATH || (existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
if (args.data) { const { readFileSync } = await import('node:fs'); await page.addInitScript(`window.__DATA = ${readFileSync(resolve(process.cwd(), args.data), 'utf8')};`); }
await page.goto(pathToFileURL(resolve(here, pageFile)).href);
await page.evaluate(() => window.__ready);
const cues = await page.evaluate(() => ({ duration: window.__duration, sfx: window.__sfx || [], vo: window.__vo || [] }));
await browser.close();
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(cues, null, 1));
console.log(`Wrote ${out} · ${cues.sfx.length} sound cues · ${cues.vo.length} narration cues`);
