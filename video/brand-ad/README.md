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

Layout rules: 96px side margins, one optical centre (y 920) for text-only scenes and the logo,
one shared header position (top 300) for visual scenes, and only one scene on screen at a time.

| Time | Scene |
|---|---|
| 0–2.6s | Violet point of light → "Your business deserves more than a template." |
| 2.7–4.9s | "Slow. Generic. Forgettable." struck through, collapsing into the light |
| 4.9–8.5s | Glass panels assemble the MBN DEV site · "From the first line of code." |
| 8.4–11.4s | Site becomes a phone, cards aligned beside it · "Built fast. Built to convert." |
| 11.5–13.1s | "Ready to elevate?" + "Get your free quote →" |
| 13.15–15s | Official logo end card + mbndev.ma |
