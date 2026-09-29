// Parallel render: splits the timeline into N chunks, renders each with render.mjs in its own
// browser, then joins them losslessly (same encoder settings → FFmpeg concat, stream copy).
// Usage: node render-par.mjs --page experience.html --scale 2 --blur 2 --jobs 4 --out out/mbndev-experience-4k.mp4
import { spawn } from 'node:child_process';
import { writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []),
);
const jobs = Number(args.jobs ?? 4);
const duration = Number(args.duration ?? 59.5);
const fps = Number(args.fps ?? 30);
const out = resolve(here, args.out ?? `out/mbndev-${(args.page ?? 'index.html').replace(/\.html$/, '')}-par.mp4`);
const tmp = resolve(here, 'out/.parts'); mkdirSync(tmp, { recursive: true });
const pass = ['page', 'scale', 'blur', 'fps', 'data'].flatMap((k) => (args[k] ? [`--${k}`, args[k]] : []));

// Chunk boundaries on whole frames so the joined file has no duplicated or missing frame.
const frames = Math.round(duration * fps);
const cuts = Array.from({ length: jobs + 1 }, (_, i) => Math.round((frames * i) / jobs) / fps);
const parts = [];
await Promise.all(cuts.slice(0, -1).map((from, i) => new Promise((ok, fail) => {
  const part = resolve(tmp, `part${i}.mp4`); parts.push(part);
  const p = spawn('node', [resolve(here, 'render.mjs'), ...pass, '--from', String(from), '--to', String(cuts[i + 1]), '--out', part], { stdio: ['ignore', 'ignore', 'inherit'] });
  p.on('close', (c) => (c === 0 ? ok() : fail(new Error(`chunk ${i} exited ${c}`))));
})));
parts.sort();
writeFileSync(resolve(tmp, 'list.txt'), parts.map((p) => `file '${p}'`).join('\n'));
await new Promise((ok) => spawn(process.env.FFMPEG_PATH || 'ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', resolve(tmp, 'list.txt'), '-c', 'copy', '-movflags', '+faststart', out], { stdio: 'inherit' }).on('close', ok));
rmSync(tmp, { recursive: true, force: true });
console.log(`Wrote ${out}`);
