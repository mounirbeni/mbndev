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
npm run render -- --page asmr.html --blur 4 # asmr.html    → out/mbndev-asmr-9x16.mp4 (22s, motion blur)
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

## asmr.html — "Website ASMR" (22s, silent)

Six satisfying UI micro-interactions, one per 2.8s, in macro close-up (object centred on y 1040,
slow push-in). Header zone: constant eyebrow + "The ___." Scene counter (mono) at y 1600. Render with `--blur 4`.

| Time | Scene |
|---|---|
| 0–2.2s | Hook · "Website ASMR." · "Tiny details you can almost hear." |
| 2.2–5.0s | 01 Toggle · three switches flip on with squash & stretch |
| 5.0–7.8s | 02 Button · cursor hover, press, ripple, morph to spinner, "Sent ✓" |
| 7.8–10.6s | 03 Loader · brand-gradient ring fills 0 → 100%, "Live ✓" pulse |
| 10.6–13.4s | 04 Checklist · four boxes tick and strike through |
| 13.4–16.2s | 05 Load-in · skeleton shimmer resolves into a real card |
| 16.2–19.0s | 06 Password · dots pop, strength meter fills, lock clicks shut |
| 19.0–22s | Official logo end card · "Details that feel right · mbndev.ma" |

## experience.html — premium brand film "It feels right." (≈106s, 4K, sound design)

One continuous story in twenty scenes: a guest searches, lands on the riad's site, loads the
Sunset Suite, checks availability, moves to her phone, books and pays, while the owner sees every
move land live (real-time sync, WhatsApp, requests, dashboard, notifications, uploads), then the
micro-interaction montage, the 60 FPS scroll, before/after, the full ecosystem and the logo.
Scenes are 4–6s each and flow into each other (continuous vertical camera + match zooms:
card → its button, small phone → big phone). Timeline lives in `experience.js`; every scene is
timed relative to its own start, so scenes can be reordered or lengthened freely.

Sound is part of the timeline: every interaction registers a cue (`window.__sfx`), and `sfx.py`
synthesises the whole mix from scratch (no samples, no music): tactile presses, soft clicks,
glass taps, whooshes, digital pulses, keyboard, notification chimes, low impacts, a light
digital bed, and a glass resonance on the logo. Narration cues (`window.__vo`) are optional:
drop `vo/vo1.wav … vo4.wav` in and pass `--vo-dir vo`.

```bash
# 1 · picture — 4K (2160×3840), motion blur, 4 parallel chunks
node render-par.mjs --page experience.html --scale 2 --blur 2 --jobs 4 --duration 105.8 --out out/mbndev-experience-4k-silent.mp4
# 2 · sound — export cues, synthesise the mix
node cues.mjs --page experience.html && python3 sfx.py out/experience-cues.json out/experience-mix.wav [--vo-dir vo]
# 3 · mux
ffmpeg -i out/mbndev-experience-4k-silent.mp4 -i out/experience-mix.wav -c:v copy -c:a aac -b:a 256k -shortest out/mbndev-experience-4k.mp4
```

`render.mjs --scale 2` renders any template at 4K; frames are captured through CDP (≈10× faster
than `page.screenshot` at 4K).

## promo.html — 30s trend promos (9:16, 60 fps, with sound design)

One template, three compositions chosen by `data/promo-<id>.json` (`{"id": "ai" | "tot" | "near"}`):
`ai` — "Will AI name your business?" (AI search) · `tot` — "This or That: website edition" (game-style format) ·
`near` — "Someone nearby is searching" (local search). Structure: hook 0–2.8s → 3 story beats → logo end card 26.6–30s.
Topics were picked from current trend reports (AI search recommendations, game-style Reels formats, local visibility).
No invented statistics: every number on screen is a demo value, not a claim.

```bash
./promo-build.sh ai 60      # picture (4 parallel chunks) → cues → synthesised sound → mux → out/promo-ai-60fps.mp4
./promo-build.sh tot 120    # 120 fps master (platforms re-encode to ≤60 fps; use only for archive/screens)
```

## Social templates

| Template | Output | Command |
|---|---|---|
| `case-study.html` | 15s 9:16 case-study reel from one project | `npm run render -- --page case-study.html --data data/<project>.json` |
| `carousel.html` | 1080×1350 carousel slides (PNG) | `node snap.mjs --page carousel.html [--data data/<carousel>.json]` |
| `posts.html` | 1080×1350 single-image posts (PNG): statement, myth vs fact, checklist, A/B poll | `node snap.mjs --page posts.html [--data data/<posts>.json]` |
| `showcase.html` | 1080×1350 real-project carousel: desktop + phone screenshots, features, CTA | `node snap.mjs --page showcase.html --data data/showcase-<project>.json` |
| `hanout.html` | Original humor carousel "If your website were a hanout": neon SVG illustrations | `node snap.mjs --page hanout.html` |
| `covers.html` | 1080×1920 reel covers (PNG), grid-safe centre 1080×1440 | `node snap.mjs --page covers.html [--data data/<covers>.json]` |

- **Case study:** copy `data/yed-lmiima.json`, fill in the project (values from `frontend/src/app/portfolio/page.tsx`), and put a
  1440×1080 screenshot of the live site in `shots/`. Note: the images in `frontend/public/images/portfolio/` are truncated PNGs
  in the repository (commit `4effca2`), so they cannot be used until they are re-exported.
- **Carousel:** slides are `cover`, `tip` (auto-numbered, icon: menu/chat/pin/bag/star), `vs` (template vs custom columns, labels
  via `vsLeft`/`vsRight`) and `cta`. Default content: "5 things every restaurant website needs". Ready-made decks in `data/`:
  `template-vs-custom.json`, `whats-included.json` (plan facts from `backend/src/lib/pricing.js`), `online-store-prep.json`,
  `losing-clients.json`, `riads-direct-booking.json`, `how-we-work.json` (stages from `ProjectStageTracker.tsx`). A `tip` slide
  with `"num": false` hides its number. `photo` shows a full image (never cropped) over its blurred copy with a caption;
  `photocover` is a 3×3 image mosaic under the title. "If your website were a grocery store": `data/grocery.json`
  with original AI-generated photos in `shots/grocery/`.
- **Covers:** one entry per reel: `label` + 2–3 words, `<span class="v">` for the violet word.

### Real screenshots (`shots/`)
Taken from the live sites with headless Chrome (popups closed, page scrolled so reveal animations run):
`riad-hero.jpg`, `riad-rooms.jpg`, `riad-mobile.jpg` (mbndemo.vercel.app, a demo/concept site — label it as a concept),
`tarique-hero.jpg`, `tarique-trust.jpg`, `tarique-mobile.jpg` (tarique.ma). Desktop 1440×900, mobile 1170×2532.
Ready data: `data/showcase-riad.json`, `data/showcase-tarique.json`, `data/case-riad.json`, `data/case-tarique.json`.
`case-study.html` accepts an optional `eyebrow` (defaults to "CASE STUDY").

## menu.html — "Scan. Read. Order." · MBN Menu (24s)

Product video for MBN Menu. Every screen in the phone and the tablet is a real screenshot of the
product (`assets/menu/*`, captured with `node menu-shots.cjs --restaurant <id> --password …` against a
local dev server). The QR code on the table card opens the live demo (mbndev.ma/m/demo).
Render with `--blur 3`, then add the synthesised sound (`cues.mjs` → `sfx.py`) and mux.

| Time | Scene |
|---|---|
| 0–2.6s | "Your menu is losing tourists." · One language. No allergens. ~~Paper.~~ |
| 2.6–6.2s | Scan the table · table card with the real QR code, scan brackets, the phone opens the menu |
| 6.2–10.2s | In their language · the same list in EN → FR → ES → IT → PT, language chips (7 supported) |
| 10.2–14.0s | Allergens, filtered · Filters → Gluten, Crustaceans, Milk → filtered list |
| 14.0–18.4s | Order from the table · dish → ×2 → Add → order → Send to the kitchen → order tracker |
| 18.4–21.2s | The kitchen sees it · owner's Live orders tab, Table 7 €40.50 highlighted, new-order notification |
| 21.2–24s | Official logo end card · MBN Menu · 7 languages · 14 allergens · Table ordering · From $37 |

## menu-explainer.html — MBN Menu walkthrough (68s, voice-over, no music)

The detailed product video: every feature on the MBN Menu page, paced on a female voice-over
(`window.__vo` gives one clip id + start time per line; the clips are Kokoro-82M `af_heart`, generated locally).
Real screenshots only: the extra guest and owner screens come from
`node menu-explainer-shots.cjs --restaurant <id> --password …` (see the header of that file for the orders,
bill and booking to place first). Sound is the UI sound design only — no ambience bed, no music.
Render with `--blur 3`; `cues.mjs` → `sfx.py` for the sound; then lay the VO clips at their `__vo` times,
duck the sound under the voice and mux.

| Time | Scene | Voice-over |
|---|---|---|
| 0–3.3s | Hook · "Your menu is losing tourists." | Your menu is losing tourists. Here's the fix. |
| 3.3–7.6s | Meet MBN Menu · six feature tiles | Meet MBN Menu. Your whole restaurant, in one QR code. |
| 7.6–13.4s | Scan the table · real QR → phone opens the menu | Guests scan the code… No app to install. |
| 13.4–18.8s | In their language · language sheet, EN → FR → ES → IT → PT | Seven languages, and AI translates your menu in a minute. |
| 18.8–24.4s | Allergens, filtered · Filters → Gluten, Crustaceans, Milk | Every dish shows the 14 EU allergens… |
| 24.4–29.9s | Order from the table · Rib-eye → Medium → Pepper sauce → note → Add → Order | They pick options and extras, add a note for the kitchen… |
| 29.9–33.7s | Track it live · Received → Preparing → On its way | Then they follow it live… |
| 33.7–38.8s | Waiter? Bill? One tap. · waiter toast, bill sheet (payment method) | Need the waiter, or the bill? One tap… |
| 38.8–44.7s | Bookings, built in · slot, guests, name → request → Confirmed | They can book a table, too, inside your opening hours… |
| 44.7–49.3s | One live screen · Live orders with the Table 7 rib-eye, zoom → bookings | Orders, calls and bookings arrive on one live screen… |
| 49.3–53.8s | Edit in seconds · menu editor, sold out, Edit dish allergens | Change a price, edit allergens, or mark a dish sold out… |
| 53.8–57.9s | Print your QR codes · real table cards + window poster | Print one QR code per table, plus a poster for your window. |
| 57.9–63.5s | Pay once · Starter $37 / Pro $67 / Agency $97 one-time | Pay once, from $37. No monthly fee. No commission… |
| 63.5–68s | Official logo end card · From $37 · mbndev.ma | MBN Menu. At mbndev.ma. |
