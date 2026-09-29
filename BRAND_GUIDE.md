# MBN DEV — Brand Guide

> **This is the single source of truth for the MBN DEV visual identity.**
> Every video, social post, image, deck, web page and motion piece must follow it.
> Every value below comes from the codebase (`frontend/tailwind.config.ts`,
> `frontend/src/app/globals.css`, `frontend/src/components/ui/Logo3D.tsx`,
> `frontend/public/manifest.json`, `frontend/src/app/layout.tsx`) or from the
> approved logo files. If this guide and the code disagree, fix one so they
> match again. Do not keep two versions of the brand.

---

## 1. Brand Overview

| | |
|---|---|
| **Name** | **MBN DEV** (always uppercase, one space, no dot or hyphen) |
| **Founder** | Mounir Banni |
| **Domain** | mbndev.ma |
| **Base** | Morocco, serving clients worldwide |
| **Type** | Independent premium web development studio plus client platform (project tracking, payments, messaging) |

### Services
The five service lines listed on the site (`/services`):
1. **Custom Websites**: business sites and portfolios built to order
2. **E-Commerce Stores**: online stores built for conversion
3. **Web Applications**: SaaS platforms, dashboards, client portals
4. **Landing Pages**: fast single-page campaign sites
5. **Support & Maintenance**: ongoing care, updates and hosting support

Official positioning line (site title): **"Custom Websites Built to Elevate Your Business."**

### Personality
- **Precise:** engineering-grade quality. Nothing looks accidental.
- **Premium but not pretentious:** high-end craft at a price independent businesses can afford.
- **Calm confidence:** results and craft do the talking. No hype.
- **Modern and technical:** Next.js-era builder, clearly current.
- **Personal:** one expert builder you deal with directly, not an anonymous agency.

### Tone of voice
- Short, direct, benefit-first sentences. Aim for about 12 words per sentence or fewer in marketing copy.
- Speak to the client's outcome ("Your store, live in 14 days"), not to tech jargon.
- Use active verbs: *Build, Launch, Scale, Elevate, Ship.*
- **Avoid:** exclamation-mark chains, emoji walls, "cheap", "best in the world", slang, all-caps sentences.
- Language: English is the primary brand language (the site is English-only).

---

## 2. Logo

### 2.1 Official files

The official mark is the **faceted, ribbon-style "MBN" monogram** in violet-to-indigo, with the **MBN DEV** wordmark (MBN in near-white, DEV in purple). It was adopted in commit `910f777` ("adopt approved MBN DEV monogram across platform").

| File | What it is | Use it for |
|---|---|---|
| `frontend/branding/approved-icon.webp.b64` | **Master source** of the approved transparent monogram (base64 WebP, 128×128, RGBA) | Source only. `npm run dev` / `npm run build` decode it into the file below |
| `frontend/public/brand-icon-transparent.webp` | Generated at build time: **the official logo, no background** (transparent), 128×128 | Web UI, favicon, PWA icon, **video end cards, posts, any overlay** |
| `frontend/public/brand-icon.webp` | Monogram on **black** (#030003), 256×256 | Avatars, profile pictures, square app tiles |
| `frontend/public/brand-logo.webp` | Full lockup **with a baked-in black background**, 560×560 | Only where the surface is solid black (e.g. a square tile). **Not for video, posts or decks:** the black backing shows as a box. |
| `frontend/src/components/ui/Logo3D.tsx` | Coded lockup: transparent monogram + live-text wordmark | All logo placements in the web app |

To get the transparent PNG/WebP outside the app, run `node frontend/scripts/build-brand-assets.mjs`, or decode it directly with
`base64 -d frontend/branding/approved-icon.webp.b64 > mbn-icon.webp`.

**The logo has no background.** Always use the transparent monogram (`brand-icon-transparent.webp`) plus the live-text wordmark (spec below, as `Logo3D.tsx` does). Never place a logo file that carries its own black backing over another background.

**Resolution note:** the transparent monogram exists only at 128 px. Show it at 1:1 where possible; in 1080p video it may be scaled up to ~1.4× (≈176 px), which is the maximum before it softens. For larger use, 4K or print, the owner must supply a higher-resolution transparent PNG or a vector (SVG) master. **Do not AI-upscale, redraw or re-generate the mark.**

### 2.2 Deprecated / legacy marks: never use
- **Old serif "MB" monogram** (silver M + purple B with a four-point star): **retired and deleted from the repository.** Never use, recreate or reference it in any material.
- Old crystal/gem mark ("MBN DEV · Premium Web Solutions") in `frontend/public/logo-app.jpeg` and `frontend/public/OFLG.jpeg`: legacy, not the current identity
- `frontend/public/favicon.svg`: old metallic-text favicon, not referenced by the app
- The purple rounded square with a white "M" drawn in `frontend/src/app/opengraph-image.tsx`: a placeholder that should be replaced with the official monogram

### 2.3 Full lockup vs. icon only

| Use the **full lockup** (monogram + MBN DEV) | Use the **icon only** (monogram) |
|---|---|
| Video end cards and brand reveals | Favicons, app icons, PWA |
| First or last slide of a carousel and deck covers | Social profile pictures (on `brand-icon.webp`) |
| Website header/footer (`<Logo3D />`) | Watermark or corner bug on videos and posts |
| Print, proposals, invoices | Loading spinners, splash animations |
| Anywhere the audience may not know the brand yet | Anywhere under 32 px wide, or where "MBN DEV" is already written nearby |

**Wordmark specification** (from `Logo3D.tsx`) for rebuilding the lockup in HTML or motion tools:
- Font: **Inter, weight 900**, letter-spacing **-0.015em**
- "MBN" = `#f4f0ff` with glow `0 0 8px rgba(196,181,253,0.18)`
- "DEV" = `#a855f7` with glow `0 0 9px rgba(168,85,247,0.27)`
- Gap between MBN and DEV = **0.33 × font size**
- Gap between icon and text ≈ **0.35 × icon size**. Icon height ≈ **1.9 × font size** (e.g. `xl`: icon 60 px, text 31 px, gap 11 px)
- **Stacked lockup** (video end cards, covers): transparent monogram on top, wordmark centred below it at ≈ 0.43 × icon height, gap ≈ 0.14 × icon height (e.g. icon 176 px, wordmark 76 px, gap 24 px).

### 2.4 Clear space and minimum size
- **Clear space:** keep a margin of at least **½ the monogram height** on every side. No text, UI, edges or other logos may enter it.
- **Minimum size:** monogram **20 px** on screen (the `xs` size in code). Full horizontal lockup **120 px** wide. On video, the monogram is **at least 6% of frame height**.

### 2.5 Approved backgrounds
- ✅ Brand background `#08080b` and the dark surfaces in §3.2
- ✅ Near-black with a soft violet radial glow behind the mark
- ✅ Dark, low-detail photography or blurred UI with a dark overlay (≥ 60% black)
- ⚠️ Mid-tone backgrounds: only if contrast stays clearly readable. Add a dark glass plate behind the mark.
- ❌ White, light grey, or any saturated color background. The mark is designed for dark only.
- ❌ Busy photos, patterns or gradients that run through the mark

### 2.6 Prohibited
- ❌ Generating, redrawing, tracing, "improving" or AI-recreating the logo. **Only the official files above may appear.**
- ❌ Using the retired serif "MB" monogram, the crystal mark, or the placeholder "M" square
- ❌ Recoloring (no single-color, gold, rainbow or inverted versions), changing the gradient, or adding outlines
- ❌ Stretching, skewing, rotating, 3D-extruding or perspective-warping the flat mark
- ❌ Adding extra glows, lens flares or drop shadows heavier than the built-in glow
- ❌ Changing the wordmark font, case, spacing or colors ("Mbn Dev", "MBNDEV", "MBN-DEV")
- ❌ Placing the icon inside a new container shape (circle, hexagon, badge) that is not approved
- ❌ Using `mix-blend-mode: screen` or other blend modes on the logo. The transparent file is shown plain (commit `c95cc99`).
- ❌ Covering part of the mark, or animating it into pieces that recombine into a different shape

---

## 3. Color System

### 3.1 Core brand colors

| Token | HEX | Source | Role |
|---|---|---|---|
| **Primary / Violet 500** | **`#7c3aed`** | `--color-primary`, `primary-500`, `theme_color` | Main brand color: CTAs, active states, glows |
| **Primary Light / Neon Purple** | **`#a855f7`** | `--color-primary-light`, `neon.purple` | "DEV" in the wordmark, highlights, gradient start |
| Violet 600 | `#6d28d9` | `primary-600` | Button gradient end, pressed states |
| Violet 700 | `#5b21b6` | `primary-700` | Deep accents |
| Violet 800 | `#4c1d95` | `primary-800` | Deep shadow tint |
| Violet 900 | `#2e1065` | `primary-900` | Darkest violet, gradient floors |
| Lavender 400 | `#a78bfa` | Tailwind violet-400 | Soft accent text, icons |
| Lavender 300 | `#c4b5fd` | Tailwind violet-300 | Glow tint, subtle highlights |
| Primary 50–200 | `#f0e7ff` `#dcc5ff` `#c39eff` | `primary-50..200` | Tints for text on violet |

### 3.2 Backgrounds and dark surfaces

| Token | HEX / value | Role |
|---|---|---|
| **Brand background** | **`#08080b`** | `--color-bg`, manifest `background_color`, `<meta theme-color>`. The default canvas everywhere. |
| Dark 400 | `#050508` | Deepest layer, letterbox, vignette edges |
| Dark 300 | `#0a0a0d` | Hero gradient ends |
| Dark 200 | `#0f0f12` | Secondary panels |
| **Surface** | `#111115` | `--color-surface`: cards |
| **Surface 2** | `#17171c` | `--color-surface-2`: raised cards, inputs |
| Dark 50 | `#18181b` | Highest raised surface |
| Violet night | `#0f0620` / `#07060f` / `#0d0b1a` | Violet-tinted dark used in hero and OG gradients |

Glass surfaces (from `globals.css`):
- `--glass-bg-card`: `rgba(18,18,25,0.85)` + `blur(24px) saturate(1.5)`
- `--glass-bg`: `rgba(16,16,22,0.90)`
- `--glass-bg-strong`: `rgba(10,10,14,0.97)` + `blur(32px) saturate(1.8)`
- `--glass-border`: `rgba(255,255,255,0.065)`

### 3.3 Text colors

| Use | Value |
|---|---|
| Headlines / primary | `#ffffff`, or `#f4f0ff` (warm lavender white, used in the wordmark) |
| Body text | `#e2e8f0` (slate-200, the global body color) |
| Secondary text | `#94a3b8` (slate-400) or `rgba(148,163,184,0.8)` |
| Muted / captions | `#64748b` (slate-500), `rgba(148,163,184,0.6)` |
| Disabled | `#475569` (slate-600) |
| Accent text | `#a855f7` or `#a78bfa` |

### 3.4 Borders and dividers
- Hairline: `rgba(255,255,255,0.04)` – `rgba(255,255,255,0.08)` (the most used range in the codebase)
- Emphasis: `rgba(255,255,255,0.10)` – `rgba(255,255,255,0.12)`
- Brand border: `rgba(124,58,237,0.15)` (`--color-border`). Hover/focus: `rgba(124,58,237,0.25)` – `rgba(124,58,237,0.55)`
- Focus ring: `0 0 0 3px rgba(124,58,237,0.10)`

### 3.5 Gradients and glow

| Name | Value | Use |
|---|---|---|
| **Primary button** | `linear-gradient(135deg, #7c3aed, #6d28d9)` | CTAs, primary chips |
| **Hero background** | `linear-gradient(135deg, #0a0a0d 0%, #0f0620 50%, #0a0a0d 100%)` | Hero sections, video backdrops |
| **Brand accent line** | `linear-gradient(90deg, transparent, #7c3aed, #a855f7, #818cf8, transparent)` | Hairline highlights, dividers |
| **Signature gradient text** | `linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)` | One key phrase per layout, not more |
| **Border glow** | `linear-gradient(135deg, #7c3aed, #3b82f6, #06b6d4)` border-box | Featured cards |
| **Glow – purple** | `radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)` | Light bloom behind hero objects and the logo |
| **Cinematic backdrop** | radial `rgba(124,58,237,0.11)` at 20%/50%, `rgba(59,130,246,0.07)` at 80%/30%, `rgba(6,182,212,0.05)` at 60%/80%, on `#08080b` | Full-frame backgrounds |
| Glow animation | `0 0 20px rgba(124,58,237,0.3)` → `0 0 40px rgba(124,58,237,0.7), 0 0 80px rgba(124,58,237,0.3)` | Pulsing CTA and logo glow (max strength) |
| Depth tints | `rgba(124,58,237, 0.04 / 0.08 / 0.14 / 0.22)` | Layer depth 1 → glow |

### 3.6 Secondary accents (supporting only)

| Color | HEX | Rule |
|---|---|---|
| Blue | `#3b82f6` | Only inside gradients or as a cool secondary glow |
| Cyan | `#06b6d4` | Only as the end of the signature gradient or a faint ambient light |
| Indigo | `#818cf8` | Gradient transitions |
| Pink | `#ec4899` | Rare, only in `gradient-text-warm`. Not for social or video. |
| Success / Warning / Error | `#10b981` / `#f59e0b` / `#ef4444` | UI status only, never as brand decoration |
| WhatsApp | `#25d366` | Only on WhatsApp contact buttons |

### 3.7 Usage by medium

| Medium | Rule of thumb |
|---|---|
| **UI** | Roughly 85% `#08080b` and dark surfaces, 10% neutral text, 5% violet. One primary CTA per view. |
| **Social posts** | Background `#08080b` → `#0f0620`. One violet glow focal point. Headline white, one accent word in `#a855f7` or the signature gradient. |
| **Video** | Frames open and close on `#08080b`. Violet `#7c3aed` is the key light. Blue and cyan appear only as faint rim or ambient light. No full-frame saturated color fills. |
| **Decks** | Dark slides only. Violet for a single data highlight per slide. |

---

## 4. Typography

### 4.1 Typefaces
| Family | Role | Loaded weights |
|---|---|---|
| **Inter** (Google Fonts, optical size 14–32) | Everything: headlines, body, UI, wordmark | 300, 400, 500, 600, 700, 800, 900 (+ 400 italic) |
| **JetBrains Mono** | Code, technical labels, numbers-as-data, terminal snippets | 400, 500 |

Fallback stacks: `Inter, system-ui, sans-serif` and `'JetBrains Mono', monospace`.
Inter stylistic sets used site-wide: `font-feature-settings: 'cv02','cv03','cv04','cv11'`. Enable them in design tools when possible.
**No other typefaces.** No serif, script or display fonts.

### 4.2 Weights and roles
| Role | Weight | Tracking | Line height |
|---|---|---|---|
| Wordmark | 900 | -0.015em | 1 |
| Display / hero headline | 800–900 | -0.02em to -0.03em | 1.0–1.1 |
| Section heading | 700 | -0.015em | 1.15 |
| Subheading | 600 | -0.01em | 1.3 |
| Body | 400 | 0 | 1.5–1.6 |
| UI labels, buttons | 500–600 | 0 | 1.2 |
| Eyebrow / kicker (uppercase) | 700 | **+0.15em** | 1.2 (as in the OG image) |
| Code / technical | JetBrains Mono 400–500 | 0 | 1.5 |

### 4.3 Rules
- **Headlines:** sentence case, maximum 2 lines on mobile, 6–8 words ideal. Highlight one word or phrase in `#a855f7` or the signature gradient.
- **Body:** never below 400 weight on dark backgrounds. Keep lines to 45–75 characters.
- **Numbers:** Inter 800–900 for big stats ("50+", "14 days"). Use `tabular-nums` in tables and counters. Labels under stats use 13–16 px muted slate with +0.05em tracking.
- **Technical text:** JetBrains Mono for code, file names, commands, version tags (`v2.4`), and HEX values. Never use mono for headlines.
- **Uppercase:** only for eyebrows and short labels, always with +0.1–0.15em tracking.

### 4.4 Suggested sizes

| Format (px canvas) | Headline | Subhead | Body / caption | Eyebrow | Min. text |
|---|---|---|---|---|---|
| Instagram post 1080×1080 | 72–96 | 36–44 | 28–32 | 22–24 | 24 |
| Instagram portrait 1080×1350 | 80–104 | 38–46 | 28–34 | 22–26 | 24 |
| Story / Reel 1080×1920 | 88–120 | 44–56 | 32–40 | 26–28 | 28 |
| Video 1920×1080 | 96–140 | 44–56 | 32–40 (subtitles 42–48) | 24–28 | 28 |
| OG / link card 1200×630 | 56–64 | 22–28 | 16–22 | 13–16 | 13 |

---

## 5. Visual Style

**Keywords:** Dark premium · Cinematic digital craft · Liquid glass · Controlled violet glow · Deep layers.

1. **Dark premium:** every composition starts from `#08080b`. Light is added sparingly. It is never the default.
2. **Cinematic digital craft:** frames are lit like a film set: one violet key light, faint blue or cyan rim light, soft vignette (`--vignette-strength: 0.65`), and generous negative space.
3. **Liquid glass / glassmorphism:** panels use translucent dark glass (`rgba(18,18,25,0.85)`, blur 24–32 px, saturate 1.5–1.8) with a 1 px white hairline at 6–8% opacity. Add a soft top-edge specular highlight. No frosted-white glass.
4. **Balanced violet glow:** glow is a light source, not a filter. Maximum 1–2 glow sources per frame, with opacity around 0.1–0.3 (up to 0.7 at the peak of a pulse). No glowing text blocks. Glow sits behind objects.
5. **Deep layers:** build 3–4 depth planes: backdrop gradient → ambient glow → glass surfaces → content. Use subtle parallax between them in motion.
6. **Soft reflections:** gentle glossy highlights on glass edges and devices, as if lit from above. No chrome, no mirror floors.
7. **Light grain:** add fractal-noise grain at **2.5–3.5% opacity** (`--noise-opacity: 0.028`, `.film-grain` 0.032, blend `overlay` or `soft-light`). This removes gradient banding and adds a film feel.
8. **Details:** dot grid `rgba(255,255,255,0.04)` or 60 px line grid at 2% for technical backdrops. Corner radius 14–24 px on cards and inputs.
9. **Inspiration, not imitation:** aim for the restraint of Apple, the gradient craft of Stripe, and the precision of Linear. **Never copy their layouts, illustrations, product shots, or signature gradients.** MBN DEV's signature is violet-on-near-black.

---

## 6. Social Media Content Rules

### 6.1 Content types that fit the brand
- **Project showcases:** a real client site in a device mockup, with 1 result line.
- **Before → After** redesigns (carousel).
- **Process / behind the build:** code snippets, Figma-to-live, performance scores.
- **Tips carousels:** "5 things your business website needs", with one idea per slide.
- **Stats and results:** Lighthouse scores, load time, conversion lift (real numbers only).
- **Offers and packages:** Starter / Pro / Premium, with clear pricing and CTA.
- **Founder presence:** Mounir at work, short talking-head clips with brand end card.
- **Testimonials:** real client quotes with permission.

### 6.2 Composition
- 8 px spacing grid. Outer safe margin is **≥ 80 px** on 1080-wide posts and **≥ 120 px** top and bottom on Stories/Reels (UI overlays).
- One focal point per frame, usually a mockup or headline with a violet glow behind it.
- Hierarchy: eyebrow → headline → 1 supporting line → CTA. **Maximum ~25 words per slide.**
- Logo: icon in a corner (≥ 6% of the short side) or the full lockup on the last slide only.
- Carousels: consistent layout grid across slides. The first slide is the hook and the last slide is the CTA plus lockup.

### 6.3 Contrast and mobile legibility
- Text contrast is at least **WCAG AA (4.5:1)**. White or `#e2e8f0` on `#08080b` always passes. Never put `#64748b` on violet.
- Test every design at **phone size (≈ 375 px wide)** before publishing. If you have to squint, it is too small.
- No text over busy parts of mockups or glows. Add a glass plate behind it.

### 6.4 Images and UI mockups
- Show **real MBN DEV work** or the real product UI (dashboards, client portal). No fake metrics.
- Devices: modern, minimal, dark-finish frames (phone, laptop, browser chrome). Tilt ≤ 15°. Soft violet rim light.
- Screenshots must be sharp (2× resolution). Blur or replace any client-private data.
- Stock photography: only dark, moody, low-saturation images, graded toward violet and blue shadows. No cheesy handshake or thumbs-up photos.
- AI-generated imagery is allowed **only for backgrounds or abstract elements**. Never for the logo, and never for fake client work.

### 6.5 Avoid
- ❌ Random colors outside §3 (orange, green, red as decoration)
- ❌ Light or white backgrounds, pastel palettes
- ❌ Over-decoration: stacked glows, lens flares, sparkles, 3D clip-art, emoji clusters
- ❌ Long paragraphs on images. Put the details in the caption.
- ❌ More than 2 font weights per slide (excluding the logo)
- ❌ Stretched, low-resolution, or generated logos
- ❌ Trend meme formats that clash with the premium tone

---

## 7. Video and Motion Design

### 7.1 Motion principles
Motion should feel **calm, weighted and precise**, like a premium product film. It should never feel bouncy or frantic.

| Token (from `globals.css`) | Value | Use |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.19, 1, 0.22, 1)` | **Default** for entrances, camera moves, logo reveal |
| `--ease-smooth` | `cubic-bezier(0.32, 0.72, 0, 1)` | Panels, sheets, UI transitions |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Small UI accents only (counters, chips) |
| `--ease-elastic` | `cubic-bezier(0.68,-0.55,0.265,1.55)` | **Avoid in brand video** |
| Durations (UI) | 100 / 180 / 320 / 500 ms | fast / base / slow / slower |

- **Video timings:** text in 0.5–0.8 s; scene transitions 0.6–1.0 s; hold readable text ≥ 1.5 s + 0.3 s per word.
- **Entrances:** fade + 20–30 px rise (`slideUp`) + slight blur-to-sharp. Stagger lines by 60–100 ms.
- **Transitions:** use cross-dissolves through black, light sweeps across glass, match cuts on shapes, and push-throughs into a UI. **No** star wipes, spins, glitch bursts or zoom-blurs.
- **Camera:** slow dolly-in (≤ 5% scale over a shot), gentle parallax between depth layers, and slow orbit around devices (≤ 20°). Keep it steady with no shake.
- **Ambient motion:** float loops of 6 s (±20 px), glow pulse of 2–4 s, grain always on.
- **Frame rate:** 30 fps for social and 24 or 30 fps for brand films. Export H.264/H.265 at high bitrate to avoid banding in gradients.

### 7.2 Sound and music
- **Music:** minimal electronic or cinematic ambient, 90–110 BPM, with warm pads, soft pulses and sparse piano or synth plucks. Build gently, with no drops or EDM risers.
- **SFX:** subtle and tactile: soft UI clicks, glass "tings", airy whooshes on transitions, and a low sub-bass swell under the logo reveal.
- **Voice-over:** calm, confident, unhurried (≈ 130–150 wpm). Always add burned-in subtitles for social, Inter 600 white at 42–48 px with a soft dark shadow.
- Mix music at −18 to −22 LUFS under VO and −14 LUFS for social delivery. Use licensed audio only.

### 7.3 Suggested structure

**Brand film (45–60 s)**
1. **0–5 s · Hook:** darkness → a single violet light blooms. One line: the problem ("Your website should work as hard as you do.").
2. **5–20 s · Craft:** macro shots of glass UI panels assembling, code in JetBrains Mono, a cursor building a layout.
3. **20–40 s · Proof:** real client sites in device mockups, performance scores, and service names (Websites · E-Commerce · Web Apps).
4. **40–52 s · Promise:** "Custom Websites Built to Elevate Your Business."
5. **52–60 s · Logo end card** (see §7.4) + URL `mbndev.ma`.

**Short ad (15 s)**
1. 0–2 s hook text on dark → 2–10 s 2–3 fast project mockups with 1 benefit line each → 10–13 s offer and CTA ("Get your quote") → 13–15 s logo end card.

### 7.4 Logo end card
1. Background settles to `#08080b` with a faint violet radial glow centered.
2. The official monogram fades in (opacity 0 → 1, scale 0.94 → 1.0, blur 8 px → 0) over **0.8–1.0 s** with `ease-out-expo`. A soft light sweep crosses it once.
3. The wordmark follows 150–250 ms later: "MBN" then "DEV", fading up 12 px.
4. Optional tagline or URL in Inter 500, slate `#94a3b8`, 300 ms later.
5. Hold for **≥ 1.5 s**. The glow breathes once (0.3 → 0.5 opacity). Then fade to black.
6. Use the transparent monogram `brand-icon-transparent.webp` with the live wordmark (the stacked lockup in §2.3), as in `video/brand-ad/*.html`. Never use `brand-logo.webp` here: its black backing shows as a box. **Never** assemble the mark from generated shapes, particles, or a redrawn vector.

### 7.5 Formats
| Ratio | Size | Use | Safe area |
|---|---|---|---|
| **16:9** | 1920×1080 (3840×2160 if assets allow) | YouTube, website hero, presentations | 5% action-safe, 10% title-safe |
| **9:16** | 1080×1920 | Reels, Stories, TikTok, Shorts | Keep text between y = 250 and 1670 px. Keep 120 px side margins clear of the right-hand UI. |
| **1:1** | 1080×1080 | Instagram / LinkedIn feed | 80 px margins |
| (4:5) | 1080×1350 | Instagram feed portrait (recommended for static) | 80 px margins |

Design the key frame for 9:16 first, then adapt it to 1:1 and 16:9. Do not simply crop.

---

## 8. Ready-to-Use Prompt Templates

> Every template **requires** the official logo file to be supplied or composited afterwards. AI tools must **not** draw the logo. Replace `{…}` placeholders.

### 8.1 Advertising image
```
Create a premium advertising image for MBN DEV, a web development studio.

BRAND RULES (mandatory):
- Background: near-black #08080b fading to deep violet night #0f0620.
- Key light: soft violet glow (#7c3aed at ~25% opacity), optional faint blue #3b82f6 / cyan #06b6d4 rim light. No other colors.
- Style: dark premium, cinematic digital craft, liquid-glass panels (dark translucent glass, 1px white hairline edges, soft top reflections), subtle film grain (~3%), deep layered depth, soft vignette.
- Mood inspired by the restraint of Apple, Stripe and Linear, with no copied elements.

SUBJECT: {e.g. a sleek laptop and phone showing a modern dark e-commerce website, floating over glass panels}
COMPOSITION: {aspect ratio}, single focal point, generous negative space in the {top/left} area reserved for a headline and the logo.

DO NOT: draw or invent any logo, letters, monogram or brand text; no watermarks; no bright or white backgrounds; no neon overload, lens flares or clutter.

POST-PRODUCTION: composite the official transparent logo (frontend/public/brand-icon-transparent.webp + the MBN DEV wordmark in Inter 900) and set text in Inter (headline 800–900 white, accent word #a855f7).
```

### 8.2 Short video
```
Produce a {15/30/60}-second {9:16 | 16:9 | 1:1} promotional video for MBN DEV (custom websites, e-commerce, web apps, landing pages, maintenance, by Mounir Banni, mbndev.ma).

VISUAL IDENTITY (mandatory):
- Palette: #08080b background, #7c3aed primary violet, #a855f7 accent, text #ffffff / #e2e8f0 / #94a3b8. Blue #3b82f6 and cyan #06b6d4 only as faint ambient light.
- Style: dark premium, cinematic, liquid-glass UI panels, controlled violet glow, deep parallax layers, soft reflections, ~3% film grain.
- Typography: Inter only (headlines 800–900, body 400–500); JetBrains Mono for code. Burned-in subtitles Inter 600.
- Motion: calm and precise; ease-out-expo cubic-bezier(0.19,1,0.22,1); fades with 20–30px rise; slow dolly-in and parallax; no glitch, spins or shake.
- Sound: minimal cinematic-electronic ambient ~100 BPM, soft glass/UI SFX, sub-bass swell on logo.

STRUCTURE:
1. Hook (0–2s): {hook line}
2. Body: {2–3 scenes: real project mockups / process / benefits}
3. CTA: {e.g. "Get your custom website — mbndev.ma"}
4. End card: official transparent MBN DEV monogram (frontend/public/brand-icon-transparent.webp, no background) with the MBN DEV wordmark fades in (0.9s, scale 0.94→1, blur→sharp), wordmark follows, hold ≥1.5s on #08080b.

DO NOT generate, redraw or animate a substitute logo. Only the official file may be used, unaltered.
```

### 8.3 Social media post
```
Design a {Instagram post 1080×1350 | carousel of N slides | Story 1080×1920} for MBN DEV.

TOPIC: {e.g. "3 signs your website is costing you clients"}
COPY: Eyebrow: {UPPERCASE 2–3 words} · Headline: {≤ 8 words} · Support: {≤ 15 words} · CTA: {e.g. "DM us 'SITE'"}

IDENTITY (mandatory):
- Background #08080b → #0f0620 with one soft violet (#7c3aed) glow behind the focal element; optional 60px grid at 2% white.
- Inter only: headline 800–900 white (#ffffff), one highlighted word in #a855f7 (or gradient #a855f7→#3b82f6→#06b6d4); body 400 #e2e8f0; eyebrow 700, +0.15em tracking, #a855f7.
- Liquid-glass cards: rgba(18,18,25,0.85), blur, 1px rgba(255,255,255,0.07) border, radius 20px.
- Margins ≥ 80px; ≤ 25 words per slide; readable at phone size; contrast ≥ 4.5:1.
- Logo: official monogram (frontend/public/brand-icon-transparent.webp) in a corner, or the stacked lockup (transparent monogram + wordmark) on the final slide, with clear space = ½ monogram height.

AVOID: other colors, white backgrounds, emoji clusters, excessive glow, long text, invented or redrawn logos.
```

---

## Maintenance
- When a brand token changes in `tailwind.config.ts` or `globals.css`, update this file in the same commit.
- New logo files must be approved by the owner, added under `frontend/branding/` or `frontend/public/`, and listed in §2.1. Remove deprecated files from §2.2 once they are deleted from the repo.
