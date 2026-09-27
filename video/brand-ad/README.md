# MBN DEV — 15s ads (9:16, silent)

Coded motion (HTML + GSAP) rendered frame by frame to MP4. Follows `BRAND_GUIDE.md`
(colors, Inter / JetBrains Mono, ease-out-expo, official logo files only).

```bash
cd video/brand-ad
npm install
npm run render                              # index.html   → out/mbndev-ad-9x16.mp4
npm run render -- --page process.html       # process.html → out/mbndev-process-9x16.mp4
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

## process.html — "From idea to live"

One glass card morphs through four steps; step eyebrow + headline stay in the same header slot,
with a 4-segment progress bar underneath.

| Time | Step |
|---|---|
| 0–1.9s | "From idea to live website." |
| 2.0–4.8s | 01 Brief · client message is typed, MBN DEV replies |
| 4.8–7.6s | 02 Design · the chat card grows into a wireframe |
| 7.6–10.4s | 03 Build · each wireframe block fills in place (demo store "Your Brand") |
| 10.4–12.8s | 04 Launch · browser bar, yourbrand.ma, LIVE, first order notification |
| 12.8–15s | Official logo end card · "From idea to live · mbndev.ma" |
