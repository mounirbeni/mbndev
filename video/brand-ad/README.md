# MBN DEV — 15s brand ad (9:16, silent)

Coded motion (HTML + GSAP) rendered frame by frame to MP4. Follows `BRAND_GUIDE.md`
(colors, Inter / JetBrains Mono, ease-out-expo, official logo files only).

```bash
cd video/brand-ad
npm install
npm run render          # → out/mbndev-ad-9x16.mp4 (1080×1920, 30 fps, no audio)
```

- Needs Chromium (`CHROME_PATH`, or Playwright's bundled one) and FFmpeg (`FFMPEG_PATH`, or on PATH).
- Preview a moment: `npm run render -- --from 12 --to 15 --out out/end.mp4`
- Edit copy and timing in `index.html` (the GSAP timeline is commented by scene).
- The "95" performance score is a placeholder; replace it with a real Lighthouse score before publishing.

| Time | Scene |
|---|---|
| 0–2.6s | Violet point of light → "Your business deserves more than a template." |
| 2.6–4.8s | "Slow. Generic. Forgettable." struck through, collapsing into the light |
| 4.9–8.7s | Glass panels assemble the MBN DEV site from depth, code texture behind |
| 8.7–11.3s | Site becomes a phone; performance ring, Mobile-first, SEO-ready, services |
| 11.3–13.2s | "Ready to elevate?" + "Get your free quote →" |
| 13.3–15s | Official logo end card + mbndev.ma |
