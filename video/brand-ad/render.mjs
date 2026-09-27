// Renders index.html frame by frame (deterministic GSAP seek) and encodes an MP4 with FFmpeg.
// Usage: npm run render  [-- --page index.html --fps 30 --from 0 --to 15 --out out/mbndev-ad-9x16.mp4]
// Needs: Chromium (CHROME_PATH or Playwright's bundled one) and ffmpeg (FFMPEG_PATH or on PATH).
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []),
);
const fps = Number(args.fps ?? 30);
const pageFile = args.page ?? 'index.html';
const defaultOut = pageFile === 'index.html' ? 'out/mbndev-ad-9x16.mp4' : `out/mbndev-${pageFile.replace(/\.html$/, '')}-9x16.mp4`;
const out = resolve(here, args.out ?? defaultOut);

// The official transparent monogram only exists as an encoded source (frontend/branding); decode it, never redraw it.
const assets = resolve(here, 'assets');
mkdirSync(assets, { recursive: true });
const b64 = readFileSync(resolve(here, '../../frontend/branding/approved-icon.webp.b64'), 'utf8').trim();
writeFileSync(resolve(assets, 'brand-icon-transparent.webp'), Buffer.from(b64, 'base64'));
mkdirSync(dirname(out), { recursive: true });

const executablePath = process.env.CHROME_PATH || (existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve(here, pageFile)).href);
await page.evaluate(() => window.__ready);

const duration = await page.evaluate(() => window.__duration);
const from = Number(args.from ?? 0);
const to = Number(args.to ?? duration);
const total = Math.round((to - from) * fps);

const ffmpeg = spawn(process.env.FFMPEG_PATH || 'ffmpeg', [
  '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-tune', 'film',
  '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-movflags', '+faststart', '-an', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });

for (let f = 0; f < total; f++) {
  const t = from + f / fps;
  await page.evaluate(([tt, ff]) => window.__render(tt, ff), [t, f]);
  const png = await page.screenshot({ type: 'png' });
  if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once('drain', r));
  if (f % fps === 0) process.stdout.write(`\r${(t).toFixed(1)}s / ${to}s`);
}
ffmpeg.stdin.end();
await new Promise((r) => ffmpeg.on('close', r));
await browser.close();
console.log(`\nWrote ${out}`);
