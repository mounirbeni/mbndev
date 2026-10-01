# Tarique (طريق) — video creation prompt (same method as the MBN DEV promos)

Paste the block into an AI agent that can write code (HTML/CSS/JS), run a headless browser and FFmpeg, and attach the
transparent logo + the site's exact colors/fonts. On-screen text is Moroccan Darija in Arabic script, right-to-left.
⚠ = confirm with the owner before publishing (features, claims, dialect wording — have a native speaker proofread the Darija).

```text
ROLE
You are a motion designer + video engineer. Produce THREE 30-second vertical promo videos for Tarique (طريق), a Moroccan marketplace
to buy and sell used cars and motorcycles (tarique.ma). They must feel like one series: same structure, same motion language,
same grid. Only the story changes.

SPEC
- 1080×1920 (9:16), 30.0 s, 60 fps, H.264 yuv420p, AAC audio. Sound design only: no music, no voice.
- Language of all on-screen text: Moroccan Darija in Arabic script. Layout is right-to-left. Use Western digits (0–9).
  Prices as “85.000 درهم”. Brand/model names stay in Latin (Dacia Logan, Golf 7 TDI…).
- Keep everything inside the safe area y 250 → 1670 (Instagram/TikTok UI covers the rest).

BRAND (confirm exact values from tarique.ma CSS or from me; do not guess)
- Dark navy background ≈ #030f27, panels ≈ #0a1d3b, electric-blue accent ≈ #3b82f6 → #5b8cff, white text, muted blue-grey.
- Red (#ef4444) = bad/warning. Blue accent = good/brand. Subtle blue glow, film grain 4–5 %, soft vignette, glass cards.
- Arabic display font + Latin sans = the ones used by the site. Arabic text must never fall back to a Latin font.
- Logo: transparent PNG/SVG file provided. Never redraw it, never place it on a box. Wordmark/lockup exactly as supplied.
- Allowed visuals: UI mockups of Tarique, simple car/motorcycle silhouettes, typography, light streaks. Forbidden: stock footage,
  real people, real number plates, manufacturer logos, other websites’ images, invented statistics, price guarantees.
  Any price or number on screen is an example and carries a small “مثال” tag.

HOW TO BUILD (this is the method that worked for the MBN DEV videos)
1. One HTML page per composition, 1080×1920, text as live HTML (never ask an AI video/image model to write text).
2. Animate with ONE paused GSAP timeline. Expose window.__render(t, frame) that calls tl.seek(t, false) and window.__duration = 30.
3. Render deterministically frame by frame: Playwright/Chromium screenshots (use CDP Page.captureScreenshot for speed) → FFmpeg at 60 fps.
   Split the timeline into 4 chunks, render in parallel, join with FFmpeg concat (stream copy); verify there is no jump at the joins.
4. Sound: every on-screen event registers a cue {type, time}. Synthesize the sounds from scratch (numpy/scipy), place them on the exact
   frame, mix to stereo 48 kHz, mux as AAC. Palette: soft key clicks while typing, tiny tick during timers, glass tap/whoosh on
   transitions, a short notification chime for good news, a muted low thud for bad news, a low impact on the hook and a deeper
   one + soft resonance on the logo. Peak ≈ −1.5 dB. No music.
5. Quality gate before delivering: ffprobe (30.0 s, 1080×1920, 60 fps, audio present); extract frames at 8–10 timestamps including
   every chunk boundary; check Arabic letter joining and direction, overlaps, cut-off text, safe area, correct logo, example tags.

STRUCTURE (identical in all three)
- 0.0–2.8 s HOOK: 2–3 big lines (≈100 px, weight 900) centered on y = 920; words rise in with blur (0.8 s, 0.1 s stagger), exit lifting up.
  A low soft impact at 0.35 s.
- 2.9 s: a small eyebrow label appears at y ≈ 290 (series name, letter-spaced, accent blue), stays until the end card.
- 3.0–26.3 s STORY: a two-line headline at y ≈ 340 (≈78 px, weight 800, one accent phrase) + a visual zone y 690 → 1620.
  One thing on screen at a time; each beat exits (lift + blur) before the next enters. Ease: expo.out in, power2.in out.
  Everything that “happens” has a sound.
- 26.6–30.0 s END CARD: logo (scale 0.94→1, blur→0) with a light sweep through the emblem, then the line “وأنت عارف كلشي”,
  then “tarique.ma” and “الرابط فـ البايو”. Deep impact at 26.9 s.

SERIES NAME / EYEBROW: «طريق · لعبة» for 1 and 2, «طريق · قيّم مركبتك» for 3.

VIDEO 1 — «حقيقي ولا نصب؟» (game: spot the red flag)
Hook: «غادي تشري / طوموبيل من النت؟ / *ركّز مزيان*» · eyebrow «لعبة · حقيقي ولا نصب؟»
Five rounds of 4.1 s starting at 3.0 s. Each round: headline «الإعلان رقم N», a listing card (silhouette, title, price with “مثال”, km, city)
with ONE highlighted line; a timer bar drains right→left for 1.9 s (ticks); then a verdict stamp + a one-line reason.
 1 «Dacia Logan 2016 — 38.000 درهم» · line «الثمن قل بزاف على ثمن السوق» → red «علامة حمراء» · reason «ثمن مغري بزاف؟ قارنو مع الثمن المرجعي»
 2 line «البائع: ما نقدرش نخليك تفحصها» → red · reason «الفحص عند ميكانيسيان حقّك»
 3 line «صور واضحة من كل الجهات + أوراق كاملة» → blue «علامة مزيانة» · reason «الوضوح كيعطي الثقة»
 4 line «سلّف ليا شي عربون قبل ما تشوفها» → red · reason «ما تدفع والو حتى تشوف وتجرب»
 5 line «بائع موثّق + مؤشر ثقة عالي» → blue · reason «هادشي كيريّح البال» ⚠ (only if verified sellers + trust score exist)
Progress dots (5) fill with each verdict. 23.6–26.3 s: «شحال عرفتي صح؟» + «كتب النتيجة فـ التعليقات».
End: «وأنت عارف كلشي».

VIDEO 2 — «هادي ولا هادي؟» (this or that, car edition)
Hook: «شنو كتختار؟ / *هادي ولا هادي؟*» · eyebrow «لعبة · هادي ولا هادي؟»
Five rounds of 4.1 s, same mechanics as the MBN DEV “This or That” video: two stacked cards A (top) / B (bottom), a draining timer,
then B wins (blue glow + check), A dims with a red ✗, a reason line, a dot fills.
 1 «الكيلومتراج»: A «كيلومتراج قليل بلا تاريخ صيانة» / B «كيلومتراج عادي مع فواتير الصيانة» → «التاريخ كيهضر أكثر من الرقم»
 2 «الثمن»: A «ثمن مغري بلا شرح» / B «ثمن قريب من الثمن المرجعي» → «الثمن خاصو يتفهم»
 3 «الصور»: A «صورة وحدة مشوشة» / B «صور واضحة من كل الجهات» → «الصورة الواضحة كتهضر»
 4 «البائع»: A «بائع مجهول» / B «بائع موثّق» → «الثقة قبل الثمن» ⚠
 5 «القرار»: A «تشري بالعجلة» / B «تقارن، تفحص، وتقرر» → «عطي لراسك الوقت»
23.7–26.3 s: «قيّم قراراتك» + «شحال خديتي من B؟».
End: «وأنت عارف كلشي».

VIDEO 3 — «شحال كتسوى طوموبيلتك؟» (valuation in 10 seconds) ⚠ only if the valuation tool exists as shown
Hook: «بغيتي تبيع طوموبيلتك؟ / *شحال كتسوى؟*»
 3.0–8.0 s form mockup fills with typing (key sounds, RTL typing): الماركة «Dacia Logan» · السنة «2018» · الكيلومتراج «120.000» · المدينة «الدار البيضاء».
 8.0–13.0 s «كنحسبو…» loader → result gauge animates and a range appears «من 78.000 إلى 86.000 درهم» with a «مثال» tag + a reference-price marker.
 13.0–22.0 s three tip cards, each with a check: «صور واضحة» · «أوراق مرتبة» · «ثمن قريب من المرجع».
 22.3–26.3 s the car is published as a listing card with a trust score → «حطها فـ طريق» (notification chime).
End: «وأنت عارف كلشي».

TRENDS (do before building)
Search the web for what is trending this month in automotive/marketplace Reels in Morocco and the Arab world. List sources.
Keep the three concepts above if they fit; adapt formats (game-style, episodic, strong 2-second hook), never copy anyone’s content.

PHASE GATES
1. Show me a storyboard (frames at 0, 2, 5, 10, 15, 20, 25, 28 s) for each video and the Darija copy. Wait for approval.
2. Build and render video 1 only. Show it + the ffprobe result + the boundary frames. Wait for approval.
3. Render videos 2 and 3.
Deliver: MP4 files named tarique-<id>-60fps.mp4, the HTML/JS sources, and a short report of anything that needs my decision.

SAFETY
No external uploads, no posting. Do not touch accounts. If something is missing (logo, fonts, confirmed features), stop and ask in one message.
```
