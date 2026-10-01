# Tarique (طريق) — strict video production standards (v2)

This replaces the looser VIDEO_PROMPT_TARIQUE.md. It is written to stop an AI agent from producing generic videos:
every rule is measurable and every delivery needs evidence.

Facts used below were cross-checked on public guides (Avito Magazine, O'Voiture, AutoActu, Expat Focus). Sources DISAGREE on
thresholds (inspection after 4 vs 5 years; certificate age 6 vs 12 months; inspection price 150–250 MAD), so the videos must NOT
show any of those numbers. ⚠ = confirm with the owner/official sources before publishing.

```text
ROLE
You are a senior motion designer and video engineer. Produce THREE 30-second vertical promo videos for Tarique (طريق),
a Moroccan marketplace to buy and sell used cars and motorcycles (tarique.ma). The result must look like premium product motion
design (clean, precise, calm, tactile) and must be indistinguishable in quality and structure from a hand-built, code-rendered
reference series. If you cannot meet EVERY rule below with your tools, say so in one message and STOP. Do not deliver a lesser version.

1. HARD RULES (any violation = reject and redo)
1.1 Everything visible is built from code: HTML/CSS/SVG + one paused GSAP timeline, rendered frame by frame (Playwright/Chromium → FFmpeg).
1.2 FORBIDDEN: AI video generators, AI image generators for any on-screen element, stock footage/photos/templates, template editors,
    screen recordings, morphing/warping, random camera moves, lens flares, glitch/zoom-punch effects, emojis in the video.
1.3 No text is ever produced by an AI model. All text is live HTML text in the brand fonts.
1.4 No invented facts, numbers or claims (section 5). No competitors, manufacturer logos, real number plates, real people.
1.5 You must deliver the evidence listed in section 7 with every video. No evidence = not delivered.

2. FORMAT
2.1 1080×1920, exactly 30.000 s, native 60 fps (the timeline is evaluated at 60 fps; never upsample from 30), H.264 High, yuv420p, bt709,
    CRF ≤ 16, AAC 256 kb/s 48 kHz stereo. Square pixels. Constant frame rate.
2.2 Safe area: all text and UI inside y 250 → 1670 and x 96 → 984. Nothing important in the top 250 px or bottom 250 px.
2.3 Layout is right-to-left. Western digits (0–9). Prices “85.000 درهم”. Latin model names stay Latin.

3. TYPOGRAPHY & LAYOUT (numbers, not adjectives)
3.1 Arabic text: the site's Arabic font; letter-spacing: 0 ALWAYS (letter-spacing breaks Arabic joining); line-height 1.35–1.5; never uppercase;
    explicit direction: rtl; verify shaping (letters connected, dots and diacritics intact, no clipped ascenders/descenders).
3.2 Sizes on the 1080 canvas: hook 96–104 px / weight 900; headline 76–80 px / 800; card title 54–60 px / 800; body ≥ 40 px / 600;
    labels ≥ 30 px. Nothing smaller than 30 px. Contrast ratio ≥ 4.5:1 (7:1 for body on glass).
3.3 One accent phrase per headline in the brand blue. Max 2 lines per headline, max 3 lines per hook, max 6 words per line.
3.4 Grid: 96 px side margins; eyebrow label at y≈290; headline at y≈340 (centered); visual zone y 690 → 1620; hook and logo centered on y = 920.
    Same positions in all three videos. Elements align to this grid; spacing multiples of 8 px; card radius 34–40 px; no element touches another (min gap 24 px).
3.5 No element may overlap another element unless the overlap is designed (badge on a card corner) and checked.

4. MOTION & SOUND (exact)
4.1 Structure (all three videos): 0.0–2.8 hook · 2.9 eyebrow in · 3.0–26.3 story · 26.6–30.0 end card.
4.2 Text in: opacity 0→1, y +36→0 px, blur 10→0 px, 0.8 s, stagger 0.07–0.11 s per word, ease expo.out.
    Text out: opacity→0, y 0→−36 px, blur 0→10 px, 0.4 s, ease power2.in. One scene at a time: a scene fully exits before the next enters.
4.3 Cards in: y +50→0, 0.6 s, expo.out. Press/confirm: scale 1→0.95→1 (0.08 s down, 0.45 s back.out(2.6)). Highlight glow ramps in 0.3–0.4 s.
4.4 Hold times: every headline and every verdict is fully visible and static for ≥ 1.2 s before it exits. Reading speed: ≥ 0.45 s per Arabic word on screen.
    Never more than one new element every 0.25 s. No motion longer than 1.0 s except slow ambient glow.
4.5 Timers/progress bars drain right→left (RTL), linear, 1.9 s. Counters ease power2.out. Typing: ~16 characters/s with a caret, right to left.
4.6 Ambient: radial glow, film grain 4–5 % (re-seeded every frame), vignette. No parallax, no shake.
4.7 Sound design only (no music, no voice). Every on-screen event has a cue within ±1 frame (16.7 ms). Palette: soft key click per typed character,
    tiny tick per timer step, glass-tap/whoosh on transitions, short two-note chime for “good”, muted low thud for “warning”,
    low impact on the hook (0.35 s) and a deeper impact + soft resonance on the logo (26.9 s). Synthesize from scratch (numpy/scipy). Peak −1.5 dBFS,
    no clipping, no DC offset, 150 ms fade-out at the end. Silence is allowed; noise is not.

5. INFORMATION STANDARDS (the content must be useful AND true)
5.1 Allowed facts = (a) features of Tarique that the OWNER confirmed in writing ⚠ (verified sellers, trust score per listing, market reference price,
    valuation tool, “no buyer commission” badge, installable app); (b) the VERIFIED-SAFE buying facts below.
5.2 Verified-safe buying facts (consistent across several Moroccan guides):
    • The registration card (carte grise) must be in the seller's name and match their ID; otherwise a notarised power of attorney is needed.
    • Compare the chassis number (VIN) on the card with the number on the vehicle.
    • Check the vehicle is free of lien/opposition (a crossed-out card needs a release document).
    • The annual road tax sticker (vignette) must be up to date; arrears pass to the new owner.
    • A valid technical inspection (visite technique) is required — NEVER state age thresholds, validity durations or prices.
    • The transfer form must be signed and signature-legalised by both parties; the transfer has a legal deadline — say “respecte le délai légal”,
      never a number.
    • A pre-purchase check by an independent mechanic is recommended; a test drive and maintenance records matter.
    • Never pay a deposit before seeing and testing the vehicle.
5.3 Anything else: omit it. No statistics, no “most buyers…”, no “best/#1”, no price guarantees, no legal certainty. Example numbers carry a “مثال” tag.
5.4 Videos that mention paperwork end with a small line: «المساطر كتتبدل — تأكد من المصادر الرسمية». Never claim to be legal advice.
5.5 Darija must be natural Moroccan Darija in Arabic script, short sentences, no Modern Standard Arabic stiffness. Deliver the Darija copy for a native
    speaker's proofreading BEFORE building.

6. THE THREE VIDEOS (copy is final unless the proofreader changes it)
Series eyebrow: «طريق · لعبة» (1, 2) / «طريق · قيّم مركبتك» (3). End card (all): logo → «وأنت عارف كلشي» → «tarique.ma» → «الرابط فـ البايو».

VIDEO 1 «علامة حمراء ولا عادي؟» — hook «غادي تشري / طوموبيل من النت؟ / *ركّز مزيان*».
 Five rounds of 4.1 s from 3.0 s; each: «الإعلان N», listing card (silhouette, “Dacia Logan 2016”, price with «مثال», km, city) with ONE highlighted line,
 draining timer, verdict stamp, one-line reason, progress dot.
 1 «الثمن قل بزاف على ثمن السوق» → red «علامة حمراء» · «ثمن مغري بزاف؟ قارنو مع الثمن المرجعي»
 2 «البائع كيرفض الفحص عند ميكانيسيان» → red · «الفحص حقّك قبل ما تدفع»
 3 «الكارط گريز على اسم البائع ورقم الشاسي كيتطابق» → blue «عادي» · «هادشي أول حاجة خاصك تتأكد منها»
 4 «كيطلب عربون قبل ما تشوف الطوموبيل» → red · «ما تدفع والو حتى تشوف وتجرب»
 5 «الفينييت والفحص التقني ساريين» → blue «عادي» · «الورق المرتب كيحميك»
 End of story 23.6–26.3: «شحال عرفتي صح؟» · «كتب النتيجة فـ التعليقات» + paperwork micro-line (5.4).
VIDEO 2 «هادي ولا هادي؟» — hook «شنو كتختار؟ / *هادي ولا هادي؟*», five rounds (A top / B bottom, B wins):
 1 «الكيلومتراج»: «كيلومتراج قليل بلا تاريخ صيانة» / «كيلومتراج عادي مع فواتير الصيانة» → «التاريخ كيهضر أكثر من الرقم»
 2 «الثمن»: «ثمن مغري بلا شرح» / «ثمن قريب من الثمن المرجعي» → «الثمن خاصو يتفهم»
 3 «الصور»: «صورة وحدة مشوشة» / «صور واضحة من كل الجهات» → «الصورة الواضحة كتهضر»
 4 «الفحص»: «شراء بلا فحص» / «فحص عند ميكانيسيان مستقل» → «الفحص كيوفر عليك المشاكل»
 5 «القرار»: «تشري بالعجلة» / «تقارن، تفحص، وتقرر» → «عطي لراسك الوقت»
 End: «شحال خديتي من B؟».
VIDEO 3 «شحال كتسوى طوموبيلتك؟» ⚠ (only if the valuation tool is confirmed): form fills (الماركة «Dacia Logan» · السنة «2018» · الكيلومتراج «120.000» ·
 المدينة «الدار البيضاء»), loader «كنحسبو…», a range «من 78.000 إلى 86.000 درهم» tagged «مثال» with a reference-price marker, three tip cards
 («صور واضحة» · «أوراق مرتبة» · «ثمن قريب من المرجع»), then the listing published with a trust score ⚠ and a chime.

7. EVIDENCE REQUIRED WITH EACH VIDEO (automated, not eyeballed)
7.1 ffprobe JSON proving: duration 30.000 s (±1 frame), 1080×1920, 60 fps constant, H.264 High, yuv420p, AAC 48 kHz stereo.
7.2 A contact sheet of 12 frames at 0.3, 1.5, 2.7, 3.5, 6, 10, 14, 18, 23, 26.5, 27.5, 29.5 s + the two frames around each render-chunk boundary.
7.3 A programmatic layout audit: at 120 sampled times, read the bounding rectangle of every text element and assert (a) inside the safe area,
    (b) no overlap between text boxes, (c) font size ≥ 30 px, (d) letter-spacing = 0 on Arabic, (e) direction = rtl. Report pass/fail counts.
7.4 Audio report: peak dBFS (≤ −1.5), no clipping, list of cue times vs the frame they land on.
7.5 The full Darija copy and the fact for each claim (which rule in 5.1/5.2 allows it).
7.6 A one-paragraph self-critique naming the three weakest moments and what you changed.

8. PHASE GATES
Gate 1: Darija copy + storyboard stills + fact table → I approve (and a native speaker proofreads). Gate 2: video 1 with all evidence → I approve.
Gate 3: videos 2 and 3. Do not start a gate before the previous one is approved.

9. STOP CONDITIONS
Missing: transparent logo, brand fonts/colors, confirmed features list, Darija proofreading → ask once and stop. Never substitute, never fake.
No posting, no uploads, no account access.
```
