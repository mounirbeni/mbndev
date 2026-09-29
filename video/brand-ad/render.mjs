// Renders index.html frame by frame (deterministic GSAP seek) and encodes an MP4 with FFmpeg.
// Usage: npm run render  [-- --page index.html --fps 30 --blur 4 --scale 2 --from 0 --to 15 --out out/mbndev-ad-9x16.mp4]
// --scale 2 renders the 1080×1920 layout at 2160×3840 (4K vertical).
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
// --data file.json feeds a template (e.g. case-study.html) with one project's content.
const dataFile = args.data ? resolve(process.cwd(), args.data) : null;
const dataName = dataFile ? '-' + dataFile.split('/').pop().replace(/\.json$/, '') : '';
const defaultOut = pageFile === 'index.html' ? 'out/mbndev-ad-9x16.mp4' : `out/mbndev-${pageFile.replace(/\.html$/, '')}${dataName}-9x16.mp4`;
const out = resolve(here, args.out ?? defaultOut);

// The official transparent monogram only exists as an encoded source (frontend/branding); decode it, never redraw it.
const assets = resolve(here, 'assets');
mkdirSync(assets, { recursive: true });
const b64 = readFileSync(resolve(here, '../../frontend/branding/approved-icon.webp.b64'), 'utf8').trim();
writeFileSync(resolve(assets, 'brand-icon-transparent.webp'), Buffer.from(b64, 'base64'));
mkdirSync(dirname(out), { recursive: true });

const executablePath = process.env.CHROME_PATH || (existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
const scale = Number(args.scale ?? 1);
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
if (dataFile) await page.addInitScript(`window.__DATA = ${readFileSync(dataFile, 'utf8')};`);
await page.goto(pathToFileURL(resolve(here, pageFile)).href);
await page.evaluate(() => window.__ready);

// Capture through CDP: ~10× faster than page.screenshot at 4K. JPEG q95 at 4K (x264 re-encodes anyway), PNG at 1080p.
const cdp = await page.context().newCDPSession(page);
const clip = { x: 0, y: 0, width: 1080, height: 1920, scale };
const shotOpts = scale > 1 ? { format: 'jpeg', quality: 95, optimizeForSpeed: true, clip } : { format: 'png', optimizeForSpeed: true };
const grab = async () => Buffer.from((await cdp.send('Page.captureScreenshot', shotOpts)).data, 'base64');

const duration = await page.evaluate(() => window.__duration);
const from = Number(args.from ?? 0);
const to = Number(args.to ?? duration);
const total = Math.round((to - from) * fps);

// Motion blur (--blur N): N sub-frame samples per frame spread over a 180° shutter
// (half the frame interval), averaged by FFmpeg's tmix — like a real camera.
const blur = Math.max(1, Number(args.blur ?? 1));
const shutter = 0.5;
const vf = blur > 1 ? ['-vf', `tmix=frames=${blur},select='eq(mod(n\\,${blur})\\,${blur - 1})',setpts=N/(${fps}*TB)`, '-r', String(fps)] : [];

const ffmpeg = spawn(process.env.FFMPEG_PATH || 'ffmpeg', [
  '-y', '-f', 'image2pipe', '-framerate', String(fps * blur), '-i', '-',
  ...vf,
  '-c:v', 'libx264', '-preset', scale > 1 ? 'medium' : 'slow', '-crf', scale > 1 ? '16' : '14', '-tune', 'film', ...(scale > 1 ? ['-profile:v', 'high', '-level', '5.1'] : []),
  '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-movflags', '+faststart', '-an', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });

for (let f = 0; f < total; f++) {
  for (let k = 0; k < blur; k++) {
    const t = from + (f + (blur > 1 ? (k / blur - 0.5) * shutter : 0)) / fps;
    await page.evaluate(([tt, ff]) => window.__render(Math.max(0, tt), ff), [t, f]);
    const img = await grab();
    if (!ffmpeg.stdin.write(img)) await new Promise((r) => ffmpeg.stdin.once('drain', r));
  }
  if (f % fps === 0) process.stdout.write(`\r${(from + f / fps).toFixed(1)}s / ${to}s`);
}
ffmpeg.stdin.end();
await new Promise((r) => ffmpeg.on('close', r));
await browser.close();
console.log(`\nWrote ${out}`);
