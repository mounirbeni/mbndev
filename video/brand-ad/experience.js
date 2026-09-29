// MBN DEV — "It feels right." Timeline for experience.html.
// Picture: one GSAP timeline, seeked frame by frame by render.mjs.
// Sound: every interaction pushes a cue into SFX (window.__sfx); sfx.py turns the cue list into the mix.
gsap.defaults({ ease: 'expo.out' });
const SM = 'power3.inOut';
const tl = gsap.timeline({ paused: true });
const SFX = [];
const S = (type, t, o = {}) => SFX.push({ type, t: Math.round(t * 1000) / 1000, ...o });
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// Narration (female, calm) — only where it adds meaning; most scenes are motion + sound only.
const VO = [
  { id: 'vo1', t: 40.95, text: "The little things aren't little." },
  { id: 'vo2', t: 51.95, text: 'Not a website.' },
  { id: 'vo3', t: 52.75, text: 'A complete digital experience.' },
  { id: 'vo4', t: 56.0, text: 'We sweat the details — so your clients feel them.' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
$$('.line').forEach((el) => { el.innerHTML = el.dataset.t.split(' ').map((w) => `<span class="w">${w}</span>`).join(' '); });
$('#o1').innerHTML = $('#o1').textContent.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
$('#o2').innerHTML = '<span class="w">It</span> <span class="w">feels</span> <span class="w hl">right.</span>';
gsap.set('.w', { opacity: 0, y: 36, filter: 'blur(10px)' });
gsap.set('#fade', { opacity: 0 });

const LINE = (sel, t) => tl.to(`${sel} .w`, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.06 }, t);
const LINEOUT = (sel, t) => tl.to(`${sel} .w`, { opacity: 0, y: -24, filter: 'blur(10px)', duration: 0.25, ease: 'power2.in' }, t);

function SHOW(n, a, b, { inDur = 0.22, outDur = 0.18, push = 0.045 } = {}) {
  const id = `#s${n}`;
  tl.fromTo(id, { autoAlpha: 0, scale: 1.04, filter: 'blur(12px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: inDur, ease: 'power2.out', immediateRender: false }, a)
    .set(id, { filter: 'none' }, a + inDur + 0.01)
    .to(id, { autoAlpha: 0, scale: 0.985, filter: 'blur(10px)', duration: outDur, ease: 'power2.in' }, b - outDur);
  const cam = $(`${id} > .cam`);
  if (cam) tl.fromTo(cam, { scale: 1 }, { scale: 1 + push, duration: b - a, ease: 'none', immediateRender: false }, a);
}
function TYPE(sel, text, t, d, snd = true) {
  const el = $(sel); const o = { n: 0 };
  tl.to(o, { n: text.length, duration: d, ease: 'none', onUpdate() { el.textContent = text.slice(0, Math.round(o.n)); } }, t);
  if (snd) for (let i = 0; i < text.length; i++) S('key', t + (d * (i + 0.5)) / text.length, { v: (i * 7919) % 17, space: text[i] === ' ' });
}
function TXT(sel, text, t) {
  const el = $(sel); const o = { v: 0 };
  tl.to(o, { v: 1, duration: 0.001, ease: 'none', onUpdate() { if (o.v >= 1) el.textContent = text; } }, t);
}
function COUNT(sel, a, b, t, d, fmt = (v) => Math.round(v).toLocaleString('en-US'), ease = 'power2.out') {
  const el = $(sel); const o = { v: a };
  tl.to(o, { v: b, duration: d, ease, onUpdate() { el.textContent = fmt(o.v); } }, t);
}
// Cursor: tip of the arrow sits at (11, 6) inside the 64px svg.
const CUR = {
  show(t, x, y) { tl.set('#cur', { x: x - 11, y: y - 6, scale: 1 }, t).to('#cur', { opacity: 1, duration: 0.2, ease: 'power2.out' }, t); },
  move(x, y, t, d = 0.45, ease = SM) { tl.to('#cur', { x: x - 11, y: y - 6, duration: d, ease }, t); },
  click(t, type = 'click') { tl.to('#cur', { scale: 0.8, duration: 0.07, ease: 'power2.out' }, t).to('#cur', { scale: 1, duration: 0.3, ease: 'back.out(3)' }, t + 0.07); S(type, t); },
  hide(t) { tl.to('#cur', { opacity: 0, duration: 0.2, ease: 'power2.in' }, t); },
};
// Touch: a soft fingertip light for mobile gestures.
function TAP(x, y, t, type = 'tap') {
  tl.set('#touch', { x, y, scale: 1.4, opacity: 0 }, t - 0.13)
    .to('#touch', { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out' }, t - 0.13)
    .to('#touch', { scale: 0.8, duration: 0.07, ease: 'power2.out' }, t)
    .fromTo('#touch i', { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 2, duration: 0.45, ease: 'power2.out', immediateRender: false }, t)
    .to('#touch', { opacity: 0, scale: 1.1, duration: 0.22, ease: 'power2.in' }, t + 0.1);
  S(type, t);
}
function DRAG(x1, y1, x2, y2, t, d, type = 'swipe') {
  tl.set('#touch', { x: x1, y: y1, scale: 1.3, opacity: 0 }, t - 0.1)
    .to('#touch', { opacity: 1, scale: 0.9, duration: 0.1, ease: 'power2.out' }, t - 0.1)
    .to('#touch', { x: x2, y: y2, duration: d, ease: 'power2.inOut' }, t)
    .to('#touch', { opacity: 0, duration: 0.16, ease: 'power2.in' }, t + d);
  S(type, t, { d });
}
const PRESS = (sel, t, s = 0.95) => tl.to(sel, { scale: s, duration: 0.07, ease: 'power2.out' }, t).to(sel, { scale: 1, duration: 0.4, ease: 'back.out(2.6)' }, t + 0.07);

// Ambient glow + light digital bed across the product scenes.
tl.to('#bgGlow', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 2.5).to('#bgGlow', { opacity: 0, duration: 0.6, ease: 'power2.in' }, 53.9);
S('ambience', 2.4, { d: 51.8 });

// ── 01 · Opening · 0–2.5 ─────────────────────────────────────────────────────
SHOW(1, 0, 2.5, { inDur: 0.01, outDur: 0.08, push: 0.03 });
S('texture', 0.05, { d: 2.4 });
tl.fromTo('#g1', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, 0.1);
tl.to('#o1 .w', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.05 }, 0.3);
S('impactSoft', 0.3);
tl.to('#o2 .w', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.06 }, 1.38)
  .fromTo('#o2', { scale: 1.07 }, { scale: 1, duration: 0.9 }, 1.45)
  .fromTo('#o1', { scale: 1 }, { scale: 0.985, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, 1.45)
  .fromTo('#g1', { scale: 1 }, { scale: 1.2, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, 1.45);
S('impact', 1.45);

// ── 02 · The button · 2.5–5.0 ────────────────────────────────────────────────
gsap.set('#b2', { xPercent: -50, yPercent: -50 });
SHOW(2, 2.42, 5.0);
CUR.show(2.5, 930, 1380);
CUR.move(600, 905, 2.58, 0.8, 'power2.inOut');
S('hover', 3.2);
tl.to('#b2', { y: -12, borderColor: 'rgba(233,213,255,0.9)', boxShadow: '0 0 120px rgba(168,85,247,0.8), 0 50px 100px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -10px 30px rgba(49,10,101,0.5)', duration: 0.35, ease: 'power2.out' }, 3.2);
tl.to('#b2', { scale: 0.95, y: 0, duration: 0.08, ease: 'power2.out' }, 3.52).to('#b2', { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, 3.6);
CUR.click(3.52, 'press');
tl.fromTo('#b2 .wave', { left: '-60%' }, { left: '140%', duration: 0.5, ease: 'power2.inOut' }, 3.54);
CUR.move(700, 1060, 3.7, 0.4, 'power2.in'); CUR.hide(3.72);
tl.to('#b2t', { opacity: 0, scale: 0.9, duration: 0.15, ease: 'power2.in' }, 3.74)
  .to('#b2', { width: 236, duration: 0.38, ease: SM }, 3.76)
  .to('#b2spin', { opacity: 1, duration: 0.15 }, 4.0)
  .fromTo('#b2spin', { rotation: 0 }, { rotation: 420, duration: 0.55, ease: 'none' }, 3.96)
  .to('#b2spin', { opacity: 0, duration: 0.1 }, 4.38)
  .to('#b2', { width: 640, duration: 0.45, ease: 'back.out(1.5)' }, 4.38)
  .fromTo('#b2ok', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.35 }, 4.48);
S('pulse', 4.02); S('confirm', 4.46);
LINE('#s2 .line', 4.05);

// ── 03 · Loading speed · 5.0–7.5 ─────────────────────────────────────────────
SHOW(3, 4.92, 7.5);
const sh = { p: -60 };
tl.to(sh, { p: 180, duration: 0.7, ease: 'none', repeat: 1, onUpdate() { $('#c3').style.setProperty('--sh', `${sh.p}%`); } }, 5.02);
S('shimmer', 5.02, { d: 1.4 });
const sk3 = $$('#c3 .sk'); const rv3 = $$('#c3 .rv');
[5.78, 5.93, 6.07, 6.21, 6.35].forEach((t, i) => {
  tl.to(sk3[i], { opacity: 0, duration: 0.2 }, t).fromTo(rv3[i], { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' }, t);
  S('appear', t, { p: i });
});
tl.fromTo('#perf', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4 }, 5.3);
COUNT('#perfN', 0, 0.8, 5.3, 1.1, (v) => `${v.toFixed(1)}s`, 'power1.out');
tl.to('#perf', { boxShadow: '0 0 34px rgba(168,85,247,0.75)', duration: 0.3, ease: 'power2.out' }, 6.4);
S('tick', 6.4);
LINE('#s3 .line', 6.3);

// ── 04 · Responsive · 7.5–10.5 ───────────────────────────────────────────────
const L4 = {
  d: { W: 960, H: 600, r: 22, links: 1, nb: 1, bur: 0, bn: 0, fs: 19,
    h: { left: 32, top: 92, width: 440, fontSize: 50 }, p: { left: 32, top: 214, width: 420 }, cta: { left: 32, top: 296, width: 230 },
    img: { left: 500, top: 92, width: 428, height: 300 }, c1: { left: 32, top: 426, width: 288, height: 146 }, c2: { left: 336, top: 426, width: 288, height: 146 }, c3: { left: 640, top: 426, width: 288, height: 146 } },
  t: { W: 640, H: 780, r: 30, links: 0, nb: 0, bur: 1, bn: 0, fs: 19,
    h: { left: 32, top: 88, width: 576, fontSize: 46 }, p: { left: 32, top: 204, width: 560 }, cta: { left: 32, top: 284, width: 230 },
    img: { left: 32, top: 364, width: 576, height: 236 }, c1: { left: 32, top: 620, width: 181, height: 136 }, c2: { left: 229, top: 620, width: 181, height: 136 }, c3: { left: 426, top: 620, width: 182, height: 136 } },
  m: { W: 380, H: 800, r: 44, links: 0, nb: 0, bur: 1, bn: 1, fs: 18,
    h: { left: 24, top: 84, width: 332, fontSize: 38 }, p: { left: 24, top: 184, width: 332 }, cta: { left: 24, top: 258, width: 332 },
    img: { left: 24, top: 332, width: 332, height: 210 }, c1: { left: 24, top: 566, width: 230, height: 112 }, c2: { left: 266, top: 566, width: 230, height: 112 }, c3: { left: 508, top: 566, width: 230, height: 112 } },
};
const K4 = ['h', 'p', 'cta', 'img', 'c1', 'c2', 'c3'];
const d4 = L4.d;
gsap.set('#fr4', { width: d4.W, height: d4.H + 44, left: 540 - d4.W / 2, borderRadius: d4.r });
K4.forEach((k) => gsap.set(`#v4${k}`, d4[k]));
gsap.set('#v4p', { fontSize: 19 });
gsap.set('#v4nb', { left: d4.W - 32 - 130, width: 130 });
gsap.set('#v4links', { left: 330 });
gsap.set('#v4burger', { left: d4.W - 24 - 46 });
gsap.set('#v4bn', { top: d4.H - 66 });
function L4to(k, t, d) {
  const l = L4[k];
  tl.to('#fr4', { width: l.W, height: l.H + 44, left: 540 - l.W / 2, borderRadius: l.r, duration: d, ease: SM }, t);
  K4.forEach((key, i) => tl.to(`#v4${key}`, { ...l[key], duration: d * 0.94, ease: SM }, t + 0.035 * i));
  tl.to('#v4p', { fontSize: l.fs, duration: d, ease: SM }, t)
    .to('#v4links', { opacity: l.links, duration: 0.22 }, t)
    .to('#v4nb', { opacity: l.nb, duration: 0.22 }, t)
    .to('#v4burger', { opacity: l.bur, left: l.W - 24 - 46, duration: d, ease: SM }, t)
    .to('#v4bn', { opacity: l.bn, top: l.H - 66, duration: d, ease: SM }, t);
  S('flow', t, { d });
  [0.02, 0.1, 0.19].forEach((o, i) => S('snap', t + d + o, { v: i }));
}
SHOW(4, 7.42, 10.5, { push: 0.03 });
L4to('t', 8.05, 0.72);
L4to('m', 9.02, 0.76);
LINE('#s4 .line', 9.6);

// ── 05 · Mobile experience · 10.5–13.0 ───────────────────────────────────────
// screen origin on stage: (214, 304)
gsap.set('#sheet5', { y: 720 });
gsap.set('#tp5', { left: 21.5 });
SHOW(5, 10.42, 13.0, { push: 0.03 });
DRAG(770, 650, 330, 640, 10.62, 0.34);
tl.to('#car5', { x: -494, duration: 0.55, ease: 'expo.out' }, 10.66);
TAP(480, 640, 11.12);
tl.to('#sheet5', { y: 0, duration: 0.45, ease: 'expo.out' }, 11.16);
S('glass', 11.16);
TAP(686, 1080, 11.55);
tl.to('#seg5', { x: 290, duration: 0.35, ease: 'expo.out' }, 11.55)
  .to('#det5', { opacity: 0, x: -30, duration: 0.2 }, 11.55)
  .fromTo('#pho5', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.35 }, 11.62);
DRAG(540, 902, 540, 1330, 11.86, 0.3, 'swipeDown');
tl.to('#sheet5', { y: 720, duration: 0.38, ease: 'power2.in' }, 11.88);
TAP(458, 1448, 12.32);
tl.to('#tp5', { left: 184.5, duration: 0.45, ease: 'expo.out' }, 12.32);
LINE('#s5 .line', 11.95);

// ── 06 · Navigation · 13.0–15.0 ──────────────────────────────────────────────
const links6 = ['#n6a', '#n6b', '#n6c', '#n6d'].map((s) => $(s));
const lx6 = (el) => ({ left: 40 + el.offsetLeft, width: el.offsetWidth });
gsap.set('#ul6', lx6(links6[0]));
gsap.set(links6[0], { color: '#ffffff' });
SHOW(6, 12.92, 15.0, { push: 0.03 });
const pages6 = ['#p6a', '#p6b', '#p6c', '#p6d'];
const lc6 = (el) => [90 + 40 + el.offsetLeft + el.offsetWidth / 2, 360 + 84 + 20];
CUR.show(13.02, 720, 1250);
[[1, 13.3], [2, 13.72], [3, 14.14]].forEach(([i, t]) => {
  const [x, y] = lc6(links6[i]);
  CUR.move(x, y, t - 0.3, 0.28);
  CUR.click(t, 'clickSoft');
  tl.to('#ul6', { ...lx6(links6[i]), duration: 0.42, ease: 'expo.out' }, t)
    .to(links6[i - 1], { color: '#64748b', duration: 0.2 }, t)
    .to(links6[i], { color: '#ffffff', duration: 0.2 }, t)
    .to(pages6[i - 1], { x: -50, opacity: 0, duration: 0.13, ease: 'power2.in' }, t)
    .fromTo(pages6[i], { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42 }, t + 0.13);
  S('whoosh', t + 0.04, { d: 0.32, v: i });
});
CUR.hide(14.45);
LINE('#s6 .line', 14.15);

// ── 07 · Search · 15.0–17.5 ──────────────────────────────────────────────────
const items7 = [
  { t: 'Luxury Riad Dar Kader', s: 'Marrakech · Medina · 4.9 ★', g: '' },
  { t: 'Luxury Villa Palmeraie', s: 'Marrakech · Palmeraie', g: 'v2' },
  { t: 'Riad Yasmine', s: 'Marrakech · Medina', g: 'v3' },
  { t: 'Lux Rooftop Suites', s: 'Essaouira · Ocean view', g: 'v2' },
  { t: 'Luxury Desert Camp', s: 'Merzouga · Sahara', g: 'v3' },
];
$('#res7').innerHTML = items7.map((it, i) => `<div class="abs r7" id="r7${i}"><i class="img ${it.g}" style="position:relative"></i><div><b>${it.t}</b><em>${it.s}</em></div></div>`).join('');
const RB7 = 670; const RH7 = 146;
items7.forEach((_, i) => gsap.set(`#r7${i}`, { top: RB7, y: i * RH7, opacity: 0 }));
const match7 = (q, title) => {
  const words = title.toLowerCase().split(' ');
  return q.toLowerCase().trim().split(/\s+/).filter(Boolean).every((w) => words.some((x) => x.startsWith(w)));
};
SHOW(7, 14.92, 17.5, { push: 0.03 });
tl.fromTo('#z7', { scale: 0.8, transformOrigin: '540px 534px' }, { scale: 1, duration: 0.9, ease: SM }, 15.0);
const Q7 = 'Luxury Riad'; const t7 = 15.42; const d7 = 1.1;
TYPE('#q7t', Q7, t7, d7);
for (let k = 1; k <= Q7.length; k++) {
  const q = Q7.slice(0, k); if (q.endsWith(' ')) continue;
  const at = t7 + (d7 * (k - 0.5)) / Q7.length + 0.03;
  const vis = items7.map((it) => match7(q, it.t));
  let idx = 0;
  vis.forEach((v, i) => { tl.to(`#r7${i}`, { opacity: v ? 1 : 0, y: (v ? idx++ : i) * RH7, duration: 0.3, ease: 'expo.out' }, at); });
  TXT('#cnt7', `${vis.filter(Boolean).length} result${vis.filter(Boolean).length === 1 ? '' : 's'}`, at);
  if (k === 1 || vis.filter(Boolean).length === 1) S('tick', at, { v: k });
}
tl.to('#r70', { borderColor: 'rgba(168,85,247,0.6)', background: 'rgba(124,58,237,0.14)', boxShadow: '0 0 40px rgba(124,58,237,0.3)', duration: 0.3 }, 16.3);
tl.to('#q7 .caret', { opacity: 0, duration: 0.01, repeat: 7, yoyo: true, repeatDelay: 0.26 }, 15.0);
CUR.show(16.35, 860, 1150);
CUR.move(560, 736, 16.4, 0.42);
CUR.click(16.9, 'click');
PRESS('#r70', 16.9, 0.97);
CUR.hide(17.2);
LINE('#s7 .line', 16.55);

// ── 08 · Smart form · 17.5–20.0  →  09 · Lead capture · 20.0–22.0 ──────────
SHOW(8, 17.42, 22.0, { push: 0.035 });
TYPE('#i8n', 'Sara El Amrani', 17.66, 0.44);
tl.fromTo($$('#f8 .inp .ck')[0], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }, 18.14);
S('confirmSoft', 18.14, { v: 0 });
TYPE('#i8e', 'sara@gmial.co', 18.24, 0.42);
tl.to('#em8', { borderColor: 'rgba(196,181,253,0.55)', duration: 0.3 }, 18.72)
  .fromTo('#hint8', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4 }, 18.72);
S('hint', 18.72);
CUR.show(18.56, 820, 980);
CUR.move(430, 800, 18.6, 0.36);
CUR.click(18.98, 'clickSoft');
tl.to('#i8e', { opacity: 0, duration: 0.14 }, 19.0).to('#i8e2', { opacity: 1, duration: 0.2 }, 19.04)
  .to('#hint8', { opacity: 0, y: -6, duration: 0.2 }, 19.04)
  .to('#em8', { borderColor: 'rgba(52,211,153,0.5)', duration: 0.3 }, 19.04)
  .fromTo($$('#f8 .inp .ck')[1], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }, 19.08);
S('confirmSoft', 19.08, { v: 1 });
TYPE('#i8p', '+212 6 12 34 56 78', 19.14, 0.36);
tl.fromTo($$('#f8 .inp .ck')[2], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }, 19.52);
TYPE('#i8m', 'Hi! I’d love a website for my riad.', 19.5, 0.45);
CUR.move(560, 1266, 19.4, 0.5);
CUR.click(20.02, 'press');
PRESS('#send8', 20.02, 0.96);
tl.to('#s8a', { opacity: 0, duration: 0.12 }, 20.05).to('#s8b', { opacity: 1, duration: 0.15 }, 20.1)
  .fromTo('#s8spin', { rotation: 0 }, { rotation: 400, duration: 0.6, ease: 'none', transformOrigin: '50% 50%' }, 20.1)
  .to('#s8b', { opacity: 0, duration: 0.12 }, 20.66).to('#s8c', { opacity: 1, duration: 0.2 }, 20.7);
S('send', 20.1); S('confirm', 20.7);
CUR.hide(20.25);
tl.to('#f8', { y: -90, scale: 0.94, opacity: 0, filter: 'blur(10px)', duration: 0.42, ease: 'power2.in' }, 20.95)
  .fromTo('#lead9', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.6 }, 21.15)
  .fromTo('#toast9', { opacity: 0, y: -50, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 21.3)
  .fromTo('#ld9new', { boxShadow: '0 0 0 rgba(124,58,237,0)' }, { boxShadow: '0 0 50px rgba(124,58,237,0.45)', duration: 0.4, ease: 'power2.out' }, 21.35);
S('notify', 21.3, { v: 0 });
LINE('#l8', 18.9); LINEOUT('#l8', 20.0); LINE('#l9', 21.35);

// ── 10 · WhatsApp · 22.0–24.5 ────────────────────────────────────────────────
SHOW(10, 21.92, 24.5, { push: 0.03 });
tl.fromTo('#wa10', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 22.1);
S('appear', 22.12, { p: 2 });
TAP(764, 1290, 22.48);
PRESS('#wa10', 22.48, 0.88);
tl.fromTo('#chat10', { opacity: 0, scale: 0.12, transformOrigin: '550px 986px', borderRadius: 200 }, { opacity: 1, scale: 1, borderRadius: 0, duration: 0.5, ease: 'expo.out' }, 22.56);
S('glass', 22.56);
tl.fromTo('#m10a', { opacity: 0, y: 20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 22.98);
S('notifyMsg', 22.98);
TXT('#st10', 'typing…', 23.3);
tl.fromTo('#m10b', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35 }, 23.32)
  .fromTo('#td10 i', { y: 0 }, { y: -8, duration: 0.14, ease: 'sine.inOut', yoyo: true, repeat: 3, stagger: 0.07 }, 23.36)
  .to('#td10', { opacity: 0, duration: 0.1, display: 'none' }, 23.84);
S('typing', 23.34, { d: 0.5 });
TYPE('#r10', 'Yes — which dates are you thinking?', 23.86, 0.55);
TXT('#st10', 'online', 24.4);
LINE('#s10 .line', 23.6);

// ── 11 · Booking flow · 24.5–27.5 ────────────────────────────────────────────
const gr11 = $('#gr11');
for (let i = 0; i < 35; i++) { const day = i - 2; const sp = document.createElement('span'); sp.textContent = day >= 1 && day <= 31 ? day : ''; if (!(day >= 1 && day <= 31)) sp.className = 'x'; sp.id = `d11_${day}`; gr11.appendChild(sp); }
const CW = 780 / 7; const RH = 84;
const cell = (day) => { const i = day + 2; return [(i % 7) * CW + CW / 2, Math.floor(i / 7) * RH + RH / 2]; };
const [x12, y12] = cell(12); const [x16] = cell(16);
gsap.set('#ci11', { left: x12 - 36, top: y12 - 36 });
gsap.set('#co11', { left: x16 - 36, top: y12 - 36 });
gsap.set('#rng11', { left: x12 - 36, top: y12 - 36, width: x16 - x12 + 72, scaleX: 0, transformOrigin: '0 50%' });
gsap.set('#sum11', { y: 640 });
SHOW(11, 24.42, 27.5, { push: 0.03 });
TAP(150 + x12, 600 + y12, 24.86);
tl.fromTo('#ci11', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.5)' }, 24.86).to('#d11_12', { color: '#fff', duration: 0.2 }, 24.86);
TAP(150 + x16, 600 + y12, 25.24);
tl.fromTo('#co11', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.5)' }, 25.24).to('#d11_16', { color: '#fff', duration: 0.2 }, 25.24)
  .to('#rng11', { scaleX: 1, duration: 0.45, ease: 'expo.out' }, 25.28)
  .to(['#d11_13', '#d11_14', '#d11_15'], { color: '#fff', duration: 0.2, stagger: 0.05 }, 25.3);
S('range', 25.28);
TAP(898, 1130, 25.62);
TXT('#g11', '2 Guests', 25.63);
tl.fromTo('#g11', { scale: 1.2 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' }, 25.63);
TAP(540, 1272, 25.94, 'press');
PRESS('#cont11', 25.94, 0.96);
tl.to('#sum11', { y: 0, duration: 0.5, ease: 'expo.out' }, 26.05);
S('glass', 26.05);
TAP(540, 1342, 26.62, 'press');
PRESS('#cf11', 26.62, 0.96);
tl.fromTo('#ok11', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 26.8)
  .fromTo('#ok11 > span', { scale: 0.5 }, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, 26.8);
S('confirmDeep', 26.8);
LINE('#s11 .line', 26.4);

// ── 12 · Payment · 27.5–30.0 ─────────────────────────────────────────────────
SHOW(12, 27.42, 30.0, { push: 0.03 });
CUR.show(27.55, 860, 1520);
CUR.move(580, 1078, 27.6, 0.42);
CUR.click(28.08, 'press');
PRESS('#pay12', 28.08, 0.96);
CUR.hide(28.3);
tl.to('#p12a', { opacity: 0, duration: 0.12 }, 28.12).to('#p12b', { opacity: 1, duration: 0.15 }, 28.15)
  .fromTo('#p12spin', { rotation: 0 }, { rotation: 400, duration: 0.6, ease: 'none', transformOrigin: '50% 50%' }, 28.15)
  .to('#p12b', { opacity: 0, duration: 0.12 }, 28.68).to('#p12c', { opacity: 1, duration: 0.2 }, 28.72);
S('secure', 28.18, { d: 0.5 }); S('confirm', 28.72);
tl.set('#co12', { opacity: 0 }, 29.04).set('#ad12', { opacity: 1 }, 29.04)
  .fromTo('#ad12', { scale: 1.04 }, { scale: 1, duration: 0.6 }, 29.04);
S('cut', 29.03);
tl.to('#pd12a', { opacity: 0, y: -10, duration: 0.2, ease: 'power2.in' }, 29.38)
  .fromTo('#pd12b', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 29.44)
  .to('#tr12', { boxShadow: '0 0 40px rgba(52,211,153,0.25)', duration: 0.3 }, 29.44);
S('confirmSoft', 29.44, { v: 2 });
LINE('#s12 .line', 29.2);

// ── 13 · Real-time sync · 30.0–33.0 ──────────────────────────────────────────
gsap.set('.beam', { left: 0, top: 0, width: 26, height: 26, borderRadius: '50%', background: '#f5f3ff', boxShadow: '0 0 26px 10px rgba(168,85,247,0.85)', xPercent: -50, yPercent: -50 });
gsap.set(['#fe13a', '#fe13b'], { height: 0, marginTop: 0, overflow: 'hidden' });
SHOW(13, 29.92, 33.0, { push: 0.03 });
TAP(266, 942, 30.42, 'press');
PRESS('#bk13', 30.42, 0.95);
tl.fromTo('#bk13ok', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 }, 30.52);
tl.fromTo('#bm13a', { x: 266, y: 942, opacity: 0 }, { opacity: 1, duration: 0.06 }, 30.5)
  .to('#bm13a', { x: 600, y: 616, duration: 0.32, ease: 'power2.in' }, 30.52)
  .to('#bm13a', { opacity: 0, scale: 2.4, duration: 0.2 }, 30.84);
S('sync', 30.5, { d: 0.34 });
tl.to('#fe13a', { height: 96, marginTop: 14, opacity: 1, duration: 0.45, ease: 'expo.out' }, 30.84)
  .fromTo('#fe13a', { boxShadow: '0 0 60px rgba(168,85,247,0.6)', borderColor: 'rgba(168,85,247,0.7)' }, { boxShadow: '0 0 0px rgba(168,85,247,0)', borderColor: 'rgba(255,255,255,0.08)', duration: 1.2, ease: 'power2.out' }, 30.9);
S('notify', 30.86, { v: 1 });
TYPE('#msg13', 'Can we check in early?', 31.2, 0.5);
TAP(440, 1132, 31.82, 'tap');
tl.fromTo('#bm13b', { x: 440, y: 1132, opacity: 0 }, { opacity: 1, duration: 0.06 }, 31.86)
  .to('#bm13b', { x: 600, y: 616, duration: 0.3, ease: 'power2.in' }, 31.88)
  .to('#bm13b', { opacity: 0, scale: 2.4, duration: 0.2 }, 32.18);
S('sync', 31.86, { d: 0.32 });
TXT('#msg13', '', 31.9);
tl.to('#fe13b', { height: 96, marginTop: 14, opacity: 1, duration: 0.45, ease: 'expo.out' }, 32.18)
  .fromTo('#fe13b', { boxShadow: '0 0 60px rgba(59,130,246,0.6)', borderColor: 'rgba(96,165,250,0.7)' }, { boxShadow: '0 0 0px rgba(59,130,246,0)', borderColor: 'rgba(255,255,255,0.08)', duration: 1.0, ease: 'power2.out' }, 32.2);
S('notify', 32.2, { v: 2 });
LINE('#s13 .line', 32.0);

// ── 14 · Dashboard · 33.0–35.5 ───────────────────────────────────────────────
SHOW(14, 32.92, 35.5, { push: 0.06 });
tl.fromTo('#db14', { scale: 0.9, y: 50, transformOrigin: '50% 40%' }, { scale: 1, y: 0, duration: 1.1, ease: SM }, 32.95);
COUNT('#n14a', 0, 12, 33.2, 0.8); COUNT('#n14b', 0, 48200, 33.2, 0.95); COUNT('#n14c', 0, 27, 33.25, 0.8); COUNT('#n14d', 0, 94, 33.3, 0.85);
S('ticks', 33.2, { d: 0.9 });
tl.to('#clr14', { attr: { width: 800 }, duration: 1.1, ease: SM }, 33.55).fromTo('#dot14', { opacity: 0, scale: 0.4, transformOrigin: '800px 40px' }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(3)' }, 34.6);
S('chart', 33.55, { d: 1.1 });
TXT('#n14a', '13', 34.25);
tl.fromTo('#n14a', { scale: 1.25, color: '#e9d5ff', transformOrigin: '0% 60%' }, { scale: 1, color: '#ffffff', duration: 0.5, ease: 'back.out(2.5)' }, 34.25);
tl.fromTo($$('#db14 .tile')[0], { boxShadow: '0 0 60px rgba(168,85,247,0.5)' }, { boxShadow: '0 0 0 rgba(168,85,247,0)', duration: 1.0, ease: 'power2.out' }, 34.25);
S('tickUp', 34.25);
LINE('#s14 .line', 34.4);

// ── 15 · File upload · 35.5–37.5 ─────────────────────────────────────────────
gsap.set('#nf15', { height: 0, marginTop: 0, overflow: 'hidden' });
SHOW(15, 35.42, 37.5, { push: 0.03 });
CUR.show(35.5, 790, 318);
CUR.click(35.6, 'grab');
tl.to('#file15', { x: -250, y: 402, rotation: -3, duration: 0.45, ease: SM }, 35.64);
CUR.move(540, 720, 35.64, 0.45);
S('drag', 35.64, { d: 0.44 });
tl.to('#dz15', { borderColor: 'rgba(196,181,253,0.9)', background: 'rgba(124,58,237,0.14)', duration: 0.2 }, 35.9)
  .to('#file15', { scale: 0.8, opacity: 0, rotation: 0, duration: 0.25, ease: 'power2.in' }, 36.08)
  .to('#dz15', { borderColor: 'rgba(196,181,253,0.35)', background: 'rgba(124,58,237,0.05)', duration: 0.4 }, 36.15);
S('drop', 36.08);
CUR.hide(36.2);
tl.fromTo('#prog15', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3 }, 36.1);
[[0, 34, 36.15, 0.18], [34, 71, 36.33, 0.22], [71, 100, 36.55, 0.22]].forEach(([a, b, t, d]) => {
  COUNT('#pn15', a, b, t, d, (v) => `${Math.round(v)}%`, 'power1.inOut');
  tl.to('#pb15', { scaleX: b / 100, duration: d, ease: 'power1.inOut' }, t);
});
S('progress', 36.15, { d: 0.62 });
TXT('#pt15', 'Uploaded ✓', 36.82);
tl.to('#pt15', { color: '#a7f3d0', duration: 0.2 }, 36.82);
S('confirm', 36.84);
tl.to('#nf15', { height: 112, marginTop: 18, opacity: 1, duration: 0.45, ease: 'expo.out' }, 36.95);
LINE('#s15 .line', 36.9);

// ── 16 · Notifications · 37.5–39.5 ───────────────────────────────────────────
SHOW(16, 37.42, 39.5, { push: 0.03 });
tl.fromTo('#nt16a', { opacity: 0, y: -150 }, { opacity: 1, y: 0, duration: 0.5 }, 37.6);
S('notify', 37.6, { v: 0 });
TAP(540, 444, 37.92);
tl.to('#nt16a', { opacity: 0, y: -60, scale: 0.96, duration: 0.25, ease: 'power2.in' }, 37.98)
  .to('#home16', { opacity: 0, x: -60, duration: 0.25, ease: 'power2.in' }, 37.98)
  .fromTo('#conv16', { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.45 }, 38.04);
S('whooshSmall', 38.0);
tl.fromTo('#nt16b', { opacity: 0, y: -150 }, { opacity: 1, y: 0, duration: 0.5 }, 38.36);
S('notify', 38.36, { v: 1 });
tl.to('#nt16b', { y: 26, scale: 0.93, opacity: 0.5, duration: 0.45, ease: 'expo.out' }, 38.78)
  .fromTo('#nt16c', { opacity: 0, y: -150 }, { opacity: 1, y: 0, duration: 0.5 }, 38.78);
S('notify', 38.78, { v: 2 });
LINE('#s16 .line', 38.7);

// ── 17 · Micro interactions · 39.5–42.5 (10 macro shots, 0.3s each) ─────────
SHOW(17, 39.42, 42.5, { push: 0.02 });
for (let i = 0; i < 10; i++) {
  const t = 39.5 + i * 0.3; const id = `#m${i + 1}`;
  tl.set(id, { autoAlpha: 1 }, t).fromTo(id, { scale: 1.08 }, { scale: 1, duration: 0.3, ease: 'power2.out', transformOrigin: '540px 900px' }, t);
  if (i < 9) tl.set(id, { autoAlpha: 0 }, t + 0.3);
}
{ const t = 39.5;
  tl.to('#m1c', { y: -26, boxShadow: '0 60px 120px rgba(0,0,0,0.6), 0 0 90px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.2)', borderColor: 'rgba(216,180,254,0.5)', duration: 0.22, ease: 'power2.out' }, t + 0.05); S('hover', t + 0.05); }
{ const t = 39.8;
  tl.to('#m2k', { width: 300, duration: 0.07, ease: 'power2.out' }, t + 0.07).to('#m2k', { left: 252, width: 228, duration: 0.16, ease: 'back.out(2)' }, t + 0.12).to('#m2on', { opacity: 1, duration: 0.14 }, t + 0.09); S('click', t + 0.08, { v: 1 }); }
{ const t = 40.1;
  tl.to('#m3f', { opacity: 1, duration: 0.1 }, t + 0.07).to('#m3p', { strokeDashoffset: 0, duration: 0.16, ease: 'power2.out' }, t + 0.1).fromTo('#m3b', { scale: 1 }, { scale: 0.88, duration: 0.06, yoyo: true, repeat: 1, immediateRender: false }, t + 0.07); S('clickSoft', t + 0.07, { v: 2 }); }
{ const t = 40.4;
  tl.fromTo('#m4m', { scaleY: 0.6, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.22 }, t + 0.07).to('#m4ch', { rotation: 180, duration: 0.2, transformOrigin: '50% 50%' }, t + 0.07); S('tap', t + 0.06, { v: 3 }); S('swipeTiny', t + 0.08); }
{ const t = 40.7;
  tl.to('#m5b', { scale: 0.93, duration: 0.06, ease: 'power2.out' }, t + 0.08).to('#m5b', { scale: 1, duration: 0.2, ease: 'back.out(3)' }, t + 0.14); S('press', t + 0.08); }
{ const t = 41.0;
  tl.fromTo('#m6i', { scale: 1 }, { scale: 0.86, duration: 0.05, yoyo: true, repeat: 1, immediateRender: false }, t + 0.05).fromTo('#m6t', { opacity: 0, y: 24, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'back.out(3)' }, t + 0.09); S('tap', t + 0.05, { v: 4 }); S('pop', t + 0.1); }
{ const t = 41.3;
  tl.to('#m7p', { x: 395, duration: 0.2, ease: 'expo.out' }, t + 0.07); S('click', t + 0.07, { v: 5 }); }
{ const t = 41.6;
  tl.to('#m8d', { background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff', borderColor: 'rgba(216,180,254,0.6)', boxShadow: '0 0 50px rgba(168,85,247,0.7)', duration: 0.12 }, t + 0.08).fromTo('#m8d', { scale: 1 }, { scale: 0.9, duration: 0.05, yoyo: true, repeat: 1, immediateRender: false }, t + 0.08); S('tap', t + 0.08, { v: 6 }); }
{ const t = 41.9;
  tl.fromTo('#m9x', { scale: 1 }, { scale: 0.82, duration: 0.05, yoyo: true, repeat: 1, immediateRender: false }, t + 0.05).to('#m9t', { x: 900, opacity: 0, duration: 0.2, ease: 'power2.in' }, t + 0.12); S('click', t + 0.05, { v: 7 }); S('swipe', t + 0.12, { d: 0.16 }); }
{ const t = 42.2;
  tl.to('#m10a', { attr: { d: 'M6 6L18 18' }, duration: 0.16, ease: 'power2.out' }, t + 0.05).to('#m10c', { attr: { d: 'M6 18L18 6' }, duration: 0.16, ease: 'power2.out' }, t + 0.05).to('#m10b', { opacity: 0, duration: 0.08 }, t + 0.05)
    .fromTo('#m10 .m10i', { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.04 }, t + 0.07); S('click', t + 0.05, { v: 8 }); S('whooshSmall', t + 0.07); }
LINE('#s17 .line', 40.95);

// ── 18 · Performance · 42.5–45.0 ─────────────────────────────────────────────
const grid18 = ['', 'v2', 'v3', 'v2', '', 'v3'].map((v) => `<div class="img ${v}" style="position:relative;height:300px"></div>`).join('');
const stat18 = ['4.9 ★', '7 rooms', '24/7'].map((x) => `<div class="glass" style="position:relative;flex:1;height:150px;border-radius:26px;display:grid;place-items:center;font-size:40px;font-weight:800;color:#fff">${x}</div>`).join('');
const srv18 = [['Suites & rooms', 'Seven rooms, each unique'], ['Hammam & spa', 'Traditional rituals'], ['Rooftop dining', 'Sunset, every night']].map(([b, e]) => `<div class="srv"><i></i><div><b>${b}</b><em>${e}</em></div></div>`).join('');
$('#col18').innerHTML = [
  '<div class="h" style="font-size:66px;line-height:1.02">Stay somewhere<br/>unforgettable.</div>',
  '<div class="img" style="position:relative;height:470px;margin-top:30px"></div>',
  `<div style="display:flex;gap:18px;margin-top:26px">${stat18}</div>`,
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:26px">${grid18}</div>`,
  '<div class="glass" style="position:relative;margin-top:26px;padding:40px;border-radius:30px"><div style="font-size:34px;line-height:1.35;color:#fff;font-weight:600">“The most beautiful stay of our trip — and booking took a minute.”</div><div class="sub" style="font-size:24px;margin-top:16px">Camille · Paris</div></div>',
  '<div class="img v2" style="position:relative;height:470px;margin-top:26px"></div>',
  `<div style="margin-top:8px">${srv18}</div>`,
  '<div class="btnP" style="height:110px;margin-top:30px;font-size:36px">Book your stay</div>',
].map((b) => `<div class="b18">${b}</div>`).join('');
SHOW(18, 42.42, 45.0, { push: 0.02 });
const SC18 = 2150; const t18 = 42.72; const d18 = 1.8;
const ease18 = gsap.parseEase('power2.inOut');
tl.to('#col18', { y: -SC18, duration: d18, ease: 'power2.inOut' }, t18);
S('scroll', t18, { d: d18 });
$$('#col18 .b18').forEach((b) => {
  const top = b.offsetTop; if (top < 950) return;
  let te = t18 + d18;
  for (let k = 0; k <= 400; k++) { const tt = t18 + (d18 * k) / 400; if (top - SC18 * ease18(k / 400) < 1000) { te = tt; break; } }
  tl.fromTo(b, { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, te - 0.06);
});
tl.fromTo('#fps18', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4 }, 42.9);
LINE('#s18 .line', 43.9);

// ── 19 · Before / After · 45.0–48.0 ──────────────────────────────────────────
$('#s19 .cam').insertAdjacentHTML('beforeend', '<div class="abs lbl" style="left:110px;top:288px">Before</div><div class="abs lbl" style="right:110px;top:288px;color:#c4b5fd">After</div>');
const sl = { x: 540 };
const applySl = () => { $('#old19').style.clipPath = `inset(0 ${Math.max(0, 990 - sl.x)}px 0 0 round 34px)`; $('#sl19').style.left = `${sl.x}px`; };
applySl();
SHOW(19, 44.92, 48.0, { push: 0.025 });
tl.to(sl, { x: 700, duration: 0.6, ease: SM, onUpdate: applySl }, 45.3)
  .to(sl, { x: 90, duration: 1.0, ease: 'power3.inOut', onUpdate: applySl }, 46.0)
  .to('#sl19', { opacity: 0, duration: 0.3 }, 46.95);
S('swipeSoft', 45.3, { d: 0.6 }); S('transform', 46.0, { d: 1.0 }); S('impactSoft', 46.98);
LINE('#s19 .line', 47.0);

// ── 20 · The system · 48.0 → final reveal ────────────────────────────────────
const eb = $('#ebtn').getBoundingClientRect();
const bx = eb.left + eb.width / 2; const by = eb.top + eb.height / 2;
gsap.set('#eco', { transformOrigin: `${bx}px ${by}px`, scale: 9, x: 540 - bx, y: 900 - by });
const eIn = [['#e1', 49.25, 0, -70], ['#e4', 49.55, -70, 0], ['#e6', 49.8, 70, 0], ['#e7', 50.0, 70, 40], ['#e3', 50.2, -70, 40], ['#e2', 50.4, 70, -60]];
eIn.forEach(([id]) => gsap.set(id, { opacity: 0 }));
SHOW(20, 47.92, 54.4, { inDur: 0.3, outDur: 0.5 });
tl.to('#eco', { scale: 1, x: 0, y: 0, duration: 3.3, ease: 'power3.inOut' }, 48.15);
S('rise', 48.1, { d: 3.6 });
eIn.forEach(([id, t, dx, dy], i) => {
  tl.fromTo(id, { opacity: 0, x: dx, y: dy, scale: 0.92 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'expo.out' }, t);
  S('assemble', t + 0.12, { v: i });
});
tl.to('#eco', { scale: 0.9, y: -10, duration: 0.9, ease: SM, transformOrigin: '540px 900px' }, 51.45);
S('settle', 51.5);
tl.fromTo('#t20a', { opacity: 0, y: 26, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }, 51.95)
  .fromTo('#t20b', { opacity: 0, y: 30, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, 52.75);

// ── End card · 54.4–59.5 ─────────────────────────────────────────────────────
gsap.set('#logoWord', { y: 12 }); gsap.set('#logoIcon', { scale: 0.94, filter: 'blur(8px)' });
tl.to('#endglow', { opacity: 1, duration: 1.0, ease: 'power2.out' }, 54.55)
  .to('#logoIcon', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.0 }, 54.7)
  .to('#logoWord', { opacity: 1, y: 0, duration: 0.9 }, 54.95)
  .set('#sweep', { opacity: 1 }, 55.1)
  .fromTo('#sweep i', { left: '-60%' }, { left: '130%', duration: 1.0, ease: 'power2.inOut' }, 55.1)
  .fromTo('#disc', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 }, 55.4)
  .fromTo('#url', { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 55.75)
  .fromTo('#sign', { opacity: 0, y: 14, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, 56.0)
  .to('#endglow', { opacity: 0.55, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 56.4)
  .to(['#logoIcon', '#logoWord', '#disc', '#url', '#sign'], { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 58.2)
  .to('#endglow', { opacity: 0, duration: 1.4, ease: 'power2.inOut' }, 58.0);
S('impactFinal', 54.7); S('resonance', 54.72, { d: 4.5 });

window.__render = (t, frame) => {
  tl.seek(t, false);
  const r = (n) => ((Math.sin(frame * 12.9898 + n * 78.233) * 43758.5453) % 1);
  gsap.set('#grain', { x: r(1) * 60, y: r(2) * 60 });
};
window.__duration = 59.5;
window.__sfx = SFX.sort((a, b) => a.t - b.t);
window.__vo = VO;
window.__ready = document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
