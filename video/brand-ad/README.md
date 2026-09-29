# MBN DEV — 15s ads (9:16, silent)

Coded motion (HTML + GSAP) rendered frame by frame to MP4. Follows `BRAND_GUIDE.md`
(colors, Inter / JetBrains Mono, ease-out-expo, official logo files only).

```bash
cd video/brand-ad
npm install
npm run render                              # index.html   → out/mbndev-ad-9x16.mp4
npm run render -- --page process.html       # process.html → out/mbndev-process-9x16.mp4
npm run render -- --page portal.html        # portal.html  → out/mbndev-portal-9x16.mp4
npm run render -- --page film.html --blur 4 # film.html    → out/mbndev-film-9x16.mp4 (21s, motion blur)
```

- Needs Chromium (`CHROME_PATH`, or Playwright's bundled one) and FFmpeg (`FFMPEG_PATH`, or on PATH).
- `--blur N` adds real motion blur: N sub-frame samples per frame over a 180° shutter, averaged by FFmpeg (N× render time).
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

## portal.html — "Control your project from your portal"

One phone showing the real client-portal features (labels taken from the app:
`ProjectStageTracker.tsx`, `lib/systemMessages.js`, payment methods from the Payment model).
The phone's tab bar doubles as the progress indicator.

| Time | Screen |
|---|---|
| 0–1.9s | "Control your project from your portal." |
| 2.0–4.8s | Project · stage tracker fills Order Received → In Development → Review, progress 60% |
| 4.8–7.4s | Messages · "Ready for your review" system card, client message, live reply |
| 7.4–10.0s | Files · upload completes; milestones Design ✓ Development ✓ |
| 10.0–12.6s | Payments · Pending verification → Paid, "Payment verified — project is now live" |
| 12.6–15s | Official logo end card · "Your project. Your portal. · mbndev.ma" |

## film.html — brand film "Crafted, not templated." (21s)

Editorial layout: visual centred on y 800, caption always bottom-left (index row + headline),
type revealed through line masks. Render with `--blur 4`.

| Time | Scene |
|---|---|
| 0–3.2s | 01 Detail · a single line of light opens into a frame · "Every pixel has a purpose." |
| 3.2–8.0s | 02 Design · exploded 3D view (grid, imagery, typography, components) locks into one page · "Designed in layers." |
| 8.0–12.0s | 03 Responsive · the same page reflows 1440 → 768 → 390 px · "Built for every screen." |
| 12.0–15.4s | 04 Principles · "Custom. Fast. Yours." set as an editorial spread |
| 15.6–18.1s | "Custom Websites Built to Elevate Your Business." |
| 18.2–21s | Official logo end card under a soft light beam · mbndev.ma |

## Social templates

| Template | Output | Command |
|---|---|---|
| `case-study.html` | 15s 9:16 case-study reel from one project | `npm run render -- --page case-study.html --data data/<project>.json` |
| `carousel.html` | 1080×1350 carousel slides (PNG) | `node snap.mjs --page carousel.html [--data data/<carousel>.json]` |
| `posts.html` | 1080×1350 single-image posts (PNG): statement, myth vs fact, checklist, A/B poll | `node snap.mjs --page posts.html [--data data/<posts>.json]` |
| `showcase.html` | 1080×1350 real-project carousel: desktop + phone screenshots, features, CTA | `node snap.mjs --page showcase.html --data data/showcase-<project>.json` |
| `covers.html` | 1080×1920 reel covers (PNG), grid-safe centre 1080×1440 | `node snap.mjs --page covers.html [--data data/<covers>.json]` |

- **Case study:** copy `data/yed-lmiima.json`, fill in the project (values from `frontend/src/app/portfolio/page.tsx`), and put a
  1440×1080 screenshot of the live site in `shots/`. Note: the images in `frontend/public/images/portfolio/` are truncated PNGs
  in the repository (commit `4effca2`), so they cannot be used until they are re-exported.
- **Carousel:** slides are `cover`, `tip` (auto-numbered, icon: menu/chat/pin/bag/star), `vs` (template vs custom columns, labels
  via `vsLeft`/`vsRight`) and `cta`. Default content: "5 things every restaurant website needs". Ready-made decks in `data/`:
  `template-vs-custom.json`, `whats-included.json` (plan facts from `backend/src/lib/pricing.js`), `online-store-prep.json`,
  `losing-clients.json`, `riads-direct-booking.json`, `how-we-work.json` (stages from `ProjectStageTracker.tsx`). A `tip` slide
  with `"num": false` hides its number.
- **Covers:** one entry per reel: `label` + 2–3 words, `<span class="v">` for the violet word.

### Real screenshots (`shots/`)
Taken from the live sites with headless Chrome (popups closed, page scrolled so reveal animations run):
`riad-hero.jpg`, `riad-rooms.jpg`, `riad-mobile.jpg` (mbndemo.vercel.app, a demo/concept site — label it as a concept),
`tarique-hero.jpg`, `tarique-trust.jpg`, `tarique-mobile.jpg` (tarique.ma). Desktop 1440×900, mobile 1170×2532.
Ready data: `data/showcase-riad.json`, `data/showcase-tarique.json`, `data/case-riad.json`, `data/case-tarique.json`.
`case-study.html` accepts an optional `eyebrow` (defaults to "CASE STUDY").
