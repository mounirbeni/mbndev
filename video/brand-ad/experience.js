// MBN DEV — "It feels right." Timeline for experience.html.
// One continuous story: a guest searches, discovers the riad, checks availability, books and pays
// on her phone — and the owner sees every move land in real time. Each scene starts where the
// previous one ended (continuous vertical camera, plus match-zooms between related shots).
// Picture: one GSAP timeline, seeked frame by frame by render.mjs.
// Sound: every interaction pushes a cue into SFX (window.__sfx); sfx.py turns the cue list into the mix.
gsap.defaults({ ease: 'expo.out' });
const SM = 'power3.inOut';
const tl = gsap.timeline({ paused: true });
const SFX = [];
const S = (type, t, o = {}) => SFX.push({ type, t: Math.round(t * 1000) / 1000, ...o });
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const VO = [];

// ── Helpers ──────────────────────────────────────────────────────────────────
$$('.line').forEach((el) => { el.innerHTML = el.dataset.t.split(' ').map((w) => `<span class="w">${w}</span>`).join(' '); });
$('#o1').innerHTML = $('#o1').textContent.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
$('#o2').innerHTML = '<span class="w">It</span> <span class="w">feels</span> <span class="w hl">right.</span>';
gsap.set('.w', { opacity: 0, y: 36, filter: 'blur(10px)' });
gsap.set('#fade', { opacity: 0 });

const LINE = (sel, t) => tl.to(`${sel} .w`, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.07 }, t);
const LINEOUT = (sel, t) => tl.to(`${sel} .w`, { opacity: 0, y: -24, filter: 'blur(10px)', duration: 0.35, ease: 'power2.in' }, t);

// Continuous camera: the outgoing scene travels up and out while the next rises into place.
const OV = 0.15;
function SHOW(n, a, b, { inFrom = { y: 140 }, inDur = 0.75, outTo = { y: -140 }, outDur = 0.45, push = 0.03, origin } = {}) {
  const id = `#s${n}`;
  if (origin) gsap.set(id, { transformOrigin: origin });
  tl.fromTo(id, { autoAlpha: 0, y: 0, scale: 1, ...inFrom }, { autoAlpha: 1, y: 0, scale: 1, duration: inDur, ease: 'power3.out', immediateRender: false }, a)
    .to(id, { ...outTo, duration: outDur, ease: 'power2.in' }, b - outDur)
    .to(id, { autoAlpha: 0, duration: outDur * 0.85, ease: 'power1.in' }, b - outDur);
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
  show(t, x, y) { tl.set('#cur', { x: x - 11, y: y - 6, scale: 1 }, t).to('#cur', { opacity: 1, duration: 0.25, ease: 'power2.out' }, t); },
  move(x, y, t, d = 0.6, ease = SM) { tl.to('#cur', { x: x - 11, y: y - 6, duration: d, ease }, t); },
  click(t, type = 'click') { tl.to('#cur', { scale: 0.8, duration: 0.08, ease: 'power2.out' }, t).to('#cur', { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.08); S(type, t); },
  hide(t) { tl.to('#cur', { opacity: 0, duration: 0.25, ease: 'power2.in' }, t); },
};
// Touch: a soft fingertip light for mobile gestures.
function TAP(x, y, t, type = 'tap') {
  tl.set('#touch', { x, y, scale: 1.4, opacity: 0 }, t - 0.18)
    .to('#touch', { opacity: 1, scale: 1, duration: 0.16, ease: 'power2.out' }, t - 0.18)
    .to('#touch', { scale: 0.8, duration: 0.08, ease: 'power2.out' }, t)
    .fromTo('#touch i', { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 2, duration: 0.5, ease: 'power2.out', immediateRender: false }, t)
    .to('#touch', { opacity: 0, scale: 1.1, duration: 0.28, ease: 'power2.in' }, t + 0.14);
  S(type, t);
}
function DRAG(x1, y1, x2, y2, t, d, type = 'swipe') {
  tl.set('#touch', { x: x1, y: y1, scale: 1.3, opacity: 0 }, t - 0.15)
    .to('#touch', { opacity: 1, scale: 0.9, duration: 0.14, ease: 'power2.out' }, t - 0.15)
    .to('#touch', { x: x2, y: y2, duration: d, ease: 'power2.inOut' }, t)
    .to('#touch', { opacity: 0, duration: 0.2, ease: 'power2.in' }, t + d);
  S(type, t, { d });
}
const PRESS = (sel, t, s = 0.95) => tl.to(sel, { scale: s, duration: 0.08, ease: 'power2.out' }, t).to(sel, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, t + 0.08);

// ── Scenes (story order) ─────────────────────────────────────────────────────
// Each entry: [section number, duration, build(t0)]. Starts are computed with overlap OV.
const SCENES = [];
const scene = (n, dur, build, opts = {}) => SCENES.push({ n, dur, build, opts });

// 01 · Opening
scene(1, 4.2, (t) => {
  S('texture', t + 0.05, { d: 4.0 });
  tl.fromTo('#g1', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 2.0, ease: 'power2.out' }, t + 0.1);
  tl.to('#o1 .w', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.07 }, t + 0.45);
  S('impactSoft', t + 0.45);
  tl.to('#o2 .w', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.08 }, t + 1.95)
    .fromTo('#o2', { scale: 1.07 }, { scale: 1, duration: 1.0 }, t + 2.02)
    .fromTo('#o1', { scale: 1 }, { scale: 0.985, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, t + 2.02)
    .fromTo('#g1', { scale: 1 }, { scale: 1.2, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, t + 2.02);
  S('impact', t + 2.02);
}, { inFrom: { y: 0 }, inDur: 0.01, outTo: { y: -160 } });

// 02 · Search — the guest looks for a riad
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
scene(7, 4.8, (t) => {
  tl.fromTo('#z7', { scale: 0.82, transformOrigin: '540px 534px' }, { scale: 1, duration: 1.2, ease: SM }, t);
  tl.to('#q7 .caret', { opacity: 0, duration: 0.01, repeat: 9, yoyo: true, repeatDelay: 0.3 }, t);
  const Q = 'Luxury Riad'; const t7 = t + 0.8; const d7 = 1.5;
  TYPE('#q7t', Q, t7, d7);
  for (let k = 1; k <= Q.length; k++) {
    const q = Q.slice(0, k); if (q.endsWith(' ')) continue;
    const at = t7 + (d7 * (k - 0.5)) / Q.length + 0.03;
    const vis = items7.map((it) => match7(q, it.t)); const cnt = vis.filter(Boolean).length;
    let idx = 0;
    vis.forEach((v, i) => { tl.to(`#r7${i}`, { opacity: v ? 1 : 0, y: (v ? idx++ : i) * RH7, duration: 0.35, ease: 'expo.out' }, at); });
    TXT('#cnt7', `${cnt} result${cnt === 1 ? '' : 's'}`, at);
    if (k === 1 || cnt === 1) S('tick', at, { v: k });
  }
  tl.to('#r70', { borderColor: 'rgba(168,85,247,0.6)', background: 'rgba(124,58,237,0.14)', boxShadow: '0 0 40px rgba(124,58,237,0.3)', duration: 0.35 }, t + 2.0);
  LINE('#s7 .line', t + 2.3);
  CUR.show(t + 2.4, 860, 1150);
  CUR.move(560, 736, t + 2.45, 0.7);
  CUR.click(t + 3.35, 'click');
  PRESS('#r70', t + 3.35, 0.97);
  CUR.hide(t + 3.9);
});

// 03 · Navigation — she lands on the riad's site and browses to Rooms
const links6 = ['#n6a', '#n6b', '#n6c', '#n6d'].map((s) => $(s));
const lx6 = (el) => ({ left: 40 + el.offsetLeft, width: el.offsetWidth });
gsap.set('#ul6', lx6(links6[0]));
gsap.set(links6[0], { color: '#ffffff' });
const pages6 = ['#p6a', '#p6b', '#p6c', '#p6d'];
const lc6 = (el) => [90 + 40 + el.offsetLeft + el.offsetWidth / 2, 360 + 84 + 20];
scene(6, 4.6, (t) => {
  CUR.show(t + 0.4, 720, 1250);
  [[1, t + 1.3], [2, t + 2.6]].forEach(([i, at]) => {
    const [x, y] = lc6(links6[i]);
    CUR.move(x, y, at - 0.55, 0.5);
    CUR.click(at, 'clickSoft');
    tl.to('#ul6', { ...lx6(links6[i]), duration: 0.5, ease: 'expo.out' }, at)
      .to(links6[i - 1], { color: '#64748b', duration: 0.25 }, at)
      .to(links6[i], { color: '#ffffff', duration: 0.25 }, at)
      .to(pages6[i - 1], { x: -50, opacity: 0, duration: 0.18, ease: 'power2.in' }, at)
      .fromTo(pages6[i], { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55 }, at + 0.16);
    S('whoosh', at + 0.05, { d: 0.36, v: i });
  });
  CUR.hide(t + 3.3);
  LINE('#s6 .line', t + 2.0);
});

// 04 · Loading — the Sunset Suite page loads, then the camera dives into its button
scene(3, 4.4, (t) => {
  const sh = { p: -60 };
  tl.to(sh, { p: 180, duration: 0.8, ease: 'none', repeat: 1, onUpdate() { $('#c3').style.setProperty('--sh', `${sh.p}%`); } }, t + 0.25);
  S('shimmer', t + 0.25, { d: 1.6 });
  const sk3 = $$('#c3 .sk'); const rv3 = $$('#c3 .rv');
  [1.25, 1.45, 1.63, 1.81, 1.99].forEach((o, i) => {
    tl.to(sk3[i], { opacity: 0, duration: 0.25 }, t + o).fromTo(rv3[i], { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }, t + o);
    S('appear', t + o, { p: i });
  });
  tl.fromTo('#perf', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4 }, t + 0.5);
  COUNT('#perfN', 0, 0.8, t + 0.5, 1.5, (v) => `${v.toFixed(1)}s`, 'power1.out');
  tl.to('#perf', { boxShadow: '0 0 34px rgba(168,85,247,0.75)', duration: 0.3, ease: 'power2.out' }, t + 2.05);
  S('tick', t + 2.05);
  LINE('#s3 .line', t + 2.2);
}, { outTo: { scale: 2.3, y: 0 }, outDur: 0.55, origin: '540px 1108px' });

// 05 · The button — close-up on "Check availability"
gsap.set('#b2', { xPercent: -50, yPercent: -50 });
scene(2, 4.6, (t) => {
  CUR.show(t + 0.5, 960, 1400);
  CUR.move(640, 925, t + 0.55, 1.0, 'power2.inOut');
  S('hover', t + 1.35);
  tl.to('#b2', { y: -12, borderColor: 'rgba(233,213,255,0.9)', boxShadow: '0 0 120px rgba(168,85,247,0.8), 0 50px 100px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -10px 30px rgba(49,10,101,0.5)', duration: 0.4, ease: 'power2.out' }, t + 1.35);
  tl.to('#b2', { scale: 0.95, y: 0, duration: 0.09, ease: 'power2.out' }, t + 1.8).to('#b2', { scale: 1, duration: 0.55, ease: 'back.out(2.4)' }, t + 1.89);
  CUR.click(t + 1.8, 'press');
  tl.fromTo('#b2 .wave', { left: '-60%' }, { left: '140%', duration: 0.6, ease: 'power2.inOut' }, t + 1.82);
  CUR.move(760, 1100, t + 2.0, 0.45, 'power2.in'); CUR.hide(t + 2.05);
  tl.to('#b2t', { opacity: 0, scale: 0.9, duration: 0.18, ease: 'power2.in' }, t + 2.05)
    .to('#b2', { width: 220, duration: 0.45, ease: SM }, t + 2.08)
    .to('#b2spin', { opacity: 1, duration: 0.18 }, t + 2.4)
    .fromTo('#b2spin', { rotation: 0 }, { rotation: 560, duration: 0.8, ease: 'none' }, t + 2.35)
    .to('#b2spin', { opacity: 0, duration: 0.12 }, t + 3.1)
    .to('#b2', { width: 620, duration: 0.5, ease: 'back.out(1.5)' }, t + 3.1)
    .fromTo('#b2ok', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 }, t + 3.2);
  S('pulse', t + 2.42); S('confirm', t + 3.18);
  LINE('#s2 .line', t + 2.5);
}, { inFrom: { scale: 0.78, y: 0 }, inDur: 0.8 });

// 06 · Responsive — the same page, from desktop to her phone
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
  K4.forEach((key, i) => tl.to(`#v4${key}`, { ...l[key], duration: d * 0.94, ease: SM }, t + 0.04 * i));
  tl.to('#v4p', { fontSize: l.fs, duration: d, ease: SM }, t)
    .to('#v4links', { opacity: l.links, duration: 0.25 }, t)
    .to('#v4nb', { opacity: l.nb, duration: 0.25 }, t)
    .to('#v4burger', { opacity: l.bur, left: l.W - 24 - 46, duration: d, ease: SM }, t)
    .to('#v4bn', { opacity: l.bn, top: l.H - 66, duration: d, ease: SM }, t);
  S('flow', t, { d });
  [0.02, 0.1, 0.19].forEach((o, i) => S('snap', t + d + o, { v: i }));
}
scene(4, 5.4, (t) => {
  L4to('t', t + 1.2, 0.95);
  L4to('m', t + 2.75, 0.95);
  LINE('#s4 .line', t + 3.0);
}, { outTo: { scale: 1.75, y: 0 }, outDur: 0.55, origin: '540px 822px' });

// 07 · Mobile — on her phone: swipe, tap, sheet, photos, close, tab
gsap.set('#sheet5', { y: 720 });
gsap.set('#tp5', { left: 21.5 });
scene(5, 5.6, (t) => {
  DRAG(770, 620, 330, 610, t + 0.9, 0.45);
  tl.to('#car5', { x: -494, duration: 0.7, ease: 'expo.out' }, t + 0.95);
  TAP(480, 610, t + 1.75);
  tl.to('#sheet5', { y: 0, duration: 0.55, ease: 'expo.out' }, t + 1.8);
  S('glass', t + 1.8);
  TAP(686, 1050, t + 2.6);
  tl.to('#seg5', { x: 290, duration: 0.4, ease: 'expo.out' }, t + 2.6)
    .to('#det5', { opacity: 0, x: -30, duration: 0.22 }, t + 2.6)
    .fromTo('#pho5', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.45 }, t + 2.68);
  DRAG(540, 872, 540, 1300, t + 3.45, 0.4, 'swipeDown');
  tl.to('#sheet5', { y: 720, duration: 0.45, ease: 'power2.in' }, t + 3.48);
  TAP(458, 1418, t + 4.2);
  tl.to('#tp5', { left: 184.5, duration: 0.5, ease: 'expo.out' }, t + 4.2);
  LINE('#s5 .line', t + 2.4);
}, { inFrom: { scale: 0.56, y: 0 }, inDur: 0.8, origin: '540px 885px' });

// 08 · Booking — she picks her dates
const gr11 = $('#gr11');
for (let i = 0; i < 35; i++) { const day = i - 2; const sp = document.createElement('span'); sp.textContent = day >= 1 && day <= 31 ? day : ''; if (!(day >= 1 && day <= 31)) sp.className = 'x'; sp.id = `d11_${day}`; gr11.appendChild(sp); }
const CW = 780 / 7; const RH = 84;
const cell = (day) => { const i = day + 2; return [(i % 7) * CW + CW / 2, Math.floor(i / 7) * RH + RH / 2]; };
const [x12, y12] = cell(12); const [x16] = cell(16);
gsap.set('#ci11', { left: x12 - 36, top: y12 - 36 });
gsap.set('#co11', { left: x16 - 36, top: y12 - 36 });
gsap.set('#rng11', { left: x12 - 36, top: y12 - 36, width: x16 - x12 + 72, scaleX: 0, transformOrigin: '0 50%' });
gsap.set('#sum11', { y: 640 });
scene(11, 5.8, (t) => {
  TAP(150 + x12, 600 + y12, t + 0.9);
  tl.fromTo('#ci11', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.5)' }, t + 0.9).to('#d11_12', { color: '#fff', duration: 0.2 }, t + 0.9);
  TAP(150 + x16, 600 + y12, t + 1.55);
  tl.fromTo('#co11', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.5)' }, t + 1.55).to('#d11_16', { color: '#fff', duration: 0.2 }, t + 1.55)
    .to('#rng11', { scaleX: 1, duration: 0.55, ease: 'expo.out' }, t + 1.6)
    .to(['#d11_13', '#d11_14', '#d11_15'], { color: '#fff', duration: 0.2, stagger: 0.06 }, t + 1.62);
  S('range', t + 1.6);
  TAP(898, 1130, t + 2.25);
  TXT('#g11', '2 Guests', t + 2.26);
  tl.fromTo('#g11', { scale: 1.2 }, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, t + 2.26);
  TAP(540, 1272, t + 2.85, 'press');
  PRESS('#cont11', t + 2.85, 0.96);
  tl.to('#sum11', { y: 0, duration: 0.6, ease: 'expo.out' }, t + 3.0);
  S('glass', t + 3.0);
  TAP(540, 1342, t + 3.95, 'press');
  PRESS('#cf11', t + 3.95, 0.96);
  tl.fromTo('#ok11', { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' }, t + 4.12)
    .fromTo('#ok11 > span', { scale: 0.5 }, { scale: 1, duration: 0.55, ease: 'back.out(2.2)' }, t + 4.12);
  S('confirmDeep', t + 4.12);
  LINE('#s11 .line', t + 3.3);
});

// 09 · Payment — she pays; the owner's order flips to Paid
scene(12, 5.0, (t) => {
  CUR.show(t + 0.4, 860, 1480);
  CUR.move(580, 1078, t + 0.45, 0.65);
  CUR.click(t + 1.25, 'press');
  PRESS('#pay12', t + 1.25, 0.96);
  CUR.hide(t + 1.5);
  tl.to('#p12a', { opacity: 0, duration: 0.14 }, t + 1.3).to('#p12b', { opacity: 1, duration: 0.18 }, t + 1.33)
    .fromTo('#p12spin', { rotation: 0 }, { rotation: 520, duration: 0.8, ease: 'none', transformOrigin: '50% 50%' }, t + 1.33)
    .to('#p12b', { opacity: 0, duration: 0.14 }, t + 2.1).to('#p12c', { opacity: 1, duration: 0.25 }, t + 2.15);
  S('secure', t + 1.36, { d: 0.7 }); S('confirm', t + 2.15);
  tl.to('#co12', { opacity: 0, y: -120, duration: 0.5, ease: 'power3.in' }, t + 2.85)
    .fromTo('#ad12', { opacity: 0, y: 160 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, t + 3.05);
  S('whooshSmall', t + 2.9);
  tl.to('#pd12a', { opacity: 0, y: -10, duration: 0.22, ease: 'power2.in' }, t + 3.75)
    .fromTo('#pd12b', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45 }, t + 3.82)
    .to('#tr12', { boxShadow: '0 0 40px rgba(52,211,153,0.25)', duration: 0.35 }, t + 3.82);
  S('confirmSoft', t + 3.82, { v: 2 });
  LINE('#s12 .line', t + 2.4);
});

// 10 · Real-time sync — customer on the left, owner's dashboard on the right
gsap.set('.beam', { left: 0, top: 0, width: 26, height: 26, borderRadius: '50%', background: '#f5f3ff', boxShadow: '0 0 26px 10px rgba(168,85,247,0.85)', xPercent: -50, yPercent: -50 });
gsap.set(['#fe13a', '#fe13b'], { height: 0, marginTop: 0, overflow: 'hidden' });
scene(13, 5.4, (t) => {
  TAP(266, 942, t + 0.9, 'press');
  PRESS('#bk13', t + 0.9, 0.95);
  tl.fromTo('#bk13ok', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, t + 1.0);
  tl.fromTo('#bm13a', { x: 266, y: 942, opacity: 0 }, { opacity: 1, duration: 0.06 }, t + 0.98)
    .to('#bm13a', { x: 600, y: 616, duration: 0.38, ease: 'power2.in' }, t + 1.0)
    .to('#bm13a', { opacity: 0, scale: 2.4, duration: 0.25 }, t + 1.38);
  S('sync', t + 0.98, { d: 0.4 });
  tl.to('#fe13a', { height: 96, marginTop: 14, opacity: 1, duration: 0.5, ease: 'expo.out' }, t + 1.38)
    .fromTo('#fe13a', { boxShadow: '0 0 60px rgba(168,85,247,0.6)', borderColor: 'rgba(168,85,247,0.7)' }, { boxShadow: '0 0 0px rgba(168,85,247,0)', borderColor: 'rgba(255,255,255,0.08)', duration: 1.4, ease: 'power2.out' }, t + 1.42);
  S('notify', t + 1.4, { v: 1 });
  TYPE('#msg13', 'Can we check in early?', t + 2.2, 0.8);
  TAP(440, 1132, t + 3.25, 'tap');
  tl.fromTo('#bm13b', { x: 440, y: 1132, opacity: 0 }, { opacity: 1, duration: 0.06 }, t + 3.3)
    .to('#bm13b', { x: 600, y: 616, duration: 0.36, ease: 'power2.in' }, t + 3.32)
    .to('#bm13b', { opacity: 0, scale: 2.4, duration: 0.25 }, t + 3.68);
  S('sync', t + 3.3, { d: 0.38 });
  TXT('#msg13', '', t + 3.34);
  tl.to('#fe13b', { height: 96, marginTop: 14, opacity: 1, duration: 0.5, ease: 'expo.out' }, t + 3.68)
    .fromTo('#fe13b', { boxShadow: '0 0 60px rgba(59,130,246,0.6)', borderColor: 'rgba(96,165,250,0.7)' }, { boxShadow: '0 0 0px rgba(59,130,246,0)', borderColor: 'rgba(255,255,255,0.08)', duration: 1.2, ease: 'power2.out' }, t + 3.7);
  S('notify', t + 3.7, { v: 2 });
  LINE('#s13 .line', t + 2.4);
});

// 11 · WhatsApp — another guest reaches the riad in one tap
scene(10, 4.9, (t) => {
  tl.fromTo('#wa10', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2)' }, t + 0.45);
  S('appear', t + 0.47, { p: 2 });
  TAP(764, 1260, t + 1.2);
  PRESS('#wa10', t + 1.2, 0.88);
  tl.fromTo('#chat10', { opacity: 0, scale: 0.12, transformOrigin: '550px 986px', borderRadius: 200 }, { opacity: 1, scale: 1, borderRadius: 0, duration: 0.6, ease: 'expo.out' }, t + 1.28);
  S('glass', t + 1.28);
  tl.fromTo('#m10a', { opacity: 0, y: 20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45 }, t + 1.95);
  S('notifyMsg', t + 1.95);
  TXT('#st10', 'typing…', t + 2.5);
  tl.fromTo('#m10b', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, t + 2.52)
    .fromTo('#td10 i', { y: 0 }, { y: -8, duration: 0.16, ease: 'sine.inOut', yoyo: true, repeat: 5, stagger: 0.08 }, t + 2.56)
    .to('#td10', { opacity: 0, duration: 0.1, display: 'none' }, t + 3.3);
  S('typing', t + 2.55, { d: 0.7 });
  TYPE('#r10', 'Yes — which dates are you thinking?', t + 3.32, 0.85);
  TXT('#st10', 'online', t + 4.3);
  LINE('#s10 .line', t + 2.6);
});

// 12–13 · Smart form → the request lands in the owner's inbox
scene(8, 8.8, (t) => {
  TYPE('#i8n', 'Sara El Amrani', t + 0.7, 0.65);
  tl.fromTo($$('#f8 .inp .ck')[0], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 1.4);
  S('confirmSoft', t + 1.4, { v: 0 });
  TYPE('#i8e', 'sara@gmial.co', t + 1.55, 0.65);
  tl.to('#em8', { borderColor: 'rgba(196,181,253,0.55)', duration: 0.35 }, t + 2.3)
    .fromTo('#hint8', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.45 }, t + 2.3);
  S('hint', t + 2.3);
  CUR.show(t + 2.3, 820, 980);
  CUR.move(430, 800, t + 2.35, 0.55);
  CUR.click(t + 3.05, 'clickSoft');
  tl.to('#i8e', { opacity: 0, duration: 0.16 }, t + 3.08).to('#i8e2', { opacity: 1, duration: 0.25 }, t + 3.12)
    .to('#hint8', { opacity: 0, y: -6, duration: 0.25 }, t + 3.12)
    .to('#em8', { borderColor: 'rgba(52,211,153,0.5)', duration: 0.35 }, t + 3.12)
    .fromTo($$('#f8 .inp .ck')[1], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 3.16);
  S('confirmSoft', t + 3.16, { v: 1 });
  TYPE('#i8p', '+212 6 12 34 56 78', t + 3.4, 0.6);
  tl.fromTo($$('#f8 .inp .ck')[2], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 4.05);
  TYPE('#i8m', 'Can you arrange an airport pickup?', t + 4.15, 0.8);
  CUR.move(560, 1266, t + 4.5, 0.6);
  CUR.click(t + 5.3, 'press');
  PRESS('#send8', t + 5.3, 0.96);
  tl.to('#s8a', { opacity: 0, duration: 0.14 }, t + 5.33).to('#s8b', { opacity: 1, duration: 0.18 }, t + 5.38)
    .fromTo('#s8spin', { rotation: 0 }, { rotation: 480, duration: 0.7, ease: 'none', transformOrigin: '50% 50%' }, t + 5.38)
    .to('#s8b', { opacity: 0, duration: 0.14 }, t + 6.05).to('#s8c', { opacity: 1, duration: 0.25 }, t + 6.1);
  S('send', t + 5.38); S('confirm', t + 6.1);
  CUR.hide(t + 5.6);
  tl.to('#f8', { y: -120, scale: 0.94, opacity: 0, duration: 0.55, ease: 'power3.in' }, t + 6.55)
    .fromTo('#lead9', { opacity: 0, y: 140 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, t + 6.8)
    .fromTo('#toast9', { opacity: 0, y: -50, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, t + 7.05)
    .fromTo('#ld9new', { boxShadow: '0 0 0 rgba(124,58,237,0)' }, { boxShadow: '0 0 50px rgba(124,58,237,0.45)', duration: 0.45, ease: 'power2.out' }, t + 7.1);
  S('whooshSmall', t + 6.6); S('notify', t + 7.05, { v: 0 });
  LINE('#l8', t + 2.6); LINEOUT('#l8', t + 6.45); LINE('#l9', t + 7.15);
});

// 14 · Dashboard — the owner's day, in one place
scene(14, 5.0, (t) => {
  tl.fromTo('#db14', { scale: 0.9, y: 50, transformOrigin: '50% 40%' }, { scale: 1, y: 0, duration: 1.3, ease: SM }, t);
  COUNT('#n14a', 0, 12, t + 0.4, 1.1); COUNT('#n14b', 0, 48200, t + 0.4, 1.3); COUNT('#n14c', 0, 27, t + 0.45, 1.1); COUNT('#n14d', 0, 94, t + 0.5, 1.2);
  S('ticks', t + 0.4, { d: 1.2 });
  tl.to('#clr14', { attr: { width: 800 }, duration: 1.6, ease: SM }, t + 0.9).fromTo('#dot14', { opacity: 0, scale: 0.4, transformOrigin: '800px 40px' }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(3)' }, t + 2.45);
  S('chart', t + 0.9, { d: 1.6 });
  TXT('#n14a', '13', t + 3.0);
  tl.fromTo('#n14a', { scale: 1.25, color: '#e9d5ff', transformOrigin: '0% 60%' }, { scale: 1, color: '#ffffff', duration: 0.55, ease: 'back.out(2.5)' }, t + 3.0);
  tl.fromTo($$('#db14 .tile')[0], { boxShadow: '0 0 60px rgba(168,85,247,0.5)' }, { boxShadow: '0 0 0 rgba(168,85,247,0)', duration: 1.2, ease: 'power2.out' }, t + 3.0);
  S('tickUp', t + 3.0);
  LINE('#s14 .line', t + 2.3);
}, { push: 0.05 });

// 15 · Notifications — on the owner's phone
scene(16, 4.8, (t) => {
  tl.fromTo('#nt16a', { opacity: 0, y: -150 }, { opacity: 1, y: 0, duration: 0.55 }, t + 0.6);
  S('notify', t + 0.6, { v: 0 });
  TAP(540, 414, t + 1.45);
  tl.to('#nt16a', { opacity: 0, y: -60, scale: 0.96, duration: 0.3, ease: 'power2.in' }, t + 1.5)
    .to('#home16', { opacity: 0, x: -60, duration: 0.3, ease: 'power2.in' }, t + 1.5)
    .fromTo('#conv16', { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.5 }, t + 1.58);
  S('whooshSmall', t + 1.52);
  tl.fromTo('#nt16b', { opacity: 0, y: -150 }, { opacity: 1, y: 0, duration: 0.55 }, t + 2.5);
  S('notify', t + 2.5, { v: 1 });
  tl.to('#nt16b', { y: 26, scale: 0.93, opacity: 0.5, duration: 0.5, ease: 'expo.out' }, t + 3.35)
    .fromTo('#nt16c', { opacity: 0, y: -150 }, { opacity: 1, y: 0, duration: 0.55 }, t + 3.35);
  S('notify', t + 3.35, { v: 2 });
  LINE('#s16 .line', t + 2.2);
});

// 16 · Upload — new photos go straight into the workspace
gsap.set('#nf15', { height: 0, marginTop: 0, overflow: 'hidden' });
scene(15, 4.6, (t) => {
  CUR.show(t + 0.35, 790, 318);
  CUR.click(t + 0.6, 'grab');
  tl.to('#file15', { x: -250, y: 402, rotation: -3, duration: 0.7, ease: SM }, t + 0.65);
  CUR.move(540, 720, t + 0.65, 0.7);
  S('drag', t + 0.65, { d: 0.68 });
  tl.to('#dz15', { borderColor: 'rgba(196,181,253,0.9)', background: 'rgba(124,58,237,0.14)', duration: 0.25 }, t + 1.05)
    .to('#file15', { scale: 0.8, opacity: 0, rotation: 0, duration: 0.3, ease: 'power2.in' }, t + 1.4)
    .to('#dz15', { borderColor: 'rgba(196,181,253,0.35)', background: 'rgba(124,58,237,0.05)', duration: 0.45 }, t + 1.5);
  S('drop', t + 1.4);
  CUR.hide(t + 1.55);
  tl.fromTo('#prog15', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35 }, t + 1.45);
  [[0, 34, 1.55, 0.3], [34, 71, 1.85, 0.35], [71, 100, 2.2, 0.35]].forEach(([a, b, o, d]) => {
    COUNT('#pn15', a, b, t + o, d, (v) => `${Math.round(v)}%`, 'power1.inOut');
    tl.to('#pb15', { scaleX: b / 100, duration: d, ease: 'power1.inOut' }, t + o);
  });
  S('progress', t + 1.55, { d: 1.0 });
  TXT('#pt15', 'Uploaded ✓', t + 2.6);
  tl.to('#pt15', { color: '#a7f3d0', duration: 0.25 }, t + 2.6);
  S('confirm', t + 2.62);
  tl.to('#nf15', { height: 112, marginTop: 18, opacity: 1, duration: 0.5, ease: 'expo.out' }, t + 2.8);
  LINE('#s15 .line', t + 2.7);
});

// 17 · Micro interactions — ten macro shots, half a second each
scene(17, 5.6, (t) => {
  for (let i = 0; i < 10; i++) {
    const at = t + 0.3 + i * 0.5; const id = `#m${i + 1}`;
    tl.set(id, { autoAlpha: 1 }, at).fromTo(id, { scale: 1.08 }, { scale: 1, duration: 0.5, ease: 'power2.out', transformOrigin: '540px 900px' }, at);
    if (i < 9) tl.set(id, { autoAlpha: 0 }, at + 0.5);
  }
  const at = (i) => t + 0.3 + i * 0.5;
  tl.to('#m1c', { y: -26, boxShadow: '0 60px 120px rgba(0,0,0,0.6), 0 0 90px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.2)', borderColor: 'rgba(216,180,254,0.5)', duration: 0.3, ease: 'power2.out' }, at(0) + 0.1); S('hover', at(0) + 0.1);
  tl.to('#m2k', { width: 300, duration: 0.08, ease: 'power2.out' }, at(1) + 0.12).to('#m2k', { left: 252, width: 228, duration: 0.2, ease: 'back.out(2)' }, at(1) + 0.18).to('#m2on', { opacity: 1, duration: 0.16 }, at(1) + 0.14); S('click', at(1) + 0.13, { v: 1 });
  tl.to('#m3f', { opacity: 1, duration: 0.12 }, at(2) + 0.12).to('#m3p', { strokeDashoffset: 0, duration: 0.2, ease: 'power2.out' }, at(2) + 0.15).fromTo('#m3b', { scale: 1 }, { scale: 0.88, duration: 0.07, yoyo: true, repeat: 1, immediateRender: false }, at(2) + 0.12); S('clickSoft', at(2) + 0.12, { v: 2 });
  tl.fromTo('#m4m', { scaleY: 0.6, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.3 }, at(3) + 0.12).to('#m4ch', { rotation: 180, duration: 0.25, transformOrigin: '50% 50%' }, at(3) + 0.12); S('tap', at(3) + 0.1, { v: 3 }); S('swipeTiny', at(3) + 0.13);
  tl.to('#m5b', { scale: 0.93, duration: 0.07, ease: 'power2.out' }, at(4) + 0.13).to('#m5b', { scale: 1, duration: 0.25, ease: 'back.out(3)' }, at(4) + 0.2); S('press', at(4) + 0.13);
  tl.fromTo('#m6i', { scale: 1 }, { scale: 0.86, duration: 0.06, yoyo: true, repeat: 1, immediateRender: false }, at(5) + 0.1).fromTo('#m6t', { opacity: 0, y: 24, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'back.out(3)' }, at(5) + 0.15); S('tap', at(5) + 0.1, { v: 4 }); S('pop', at(5) + 0.15);
  tl.to('#m7p', { x: 395, duration: 0.25, ease: 'expo.out' }, at(6) + 0.12); S('click', at(6) + 0.12, { v: 5 });
  tl.to('#m8d', { background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff', borderColor: 'rgba(216,180,254,0.6)', boxShadow: '0 0 50px rgba(168,85,247,0.7)', duration: 0.15 }, at(7) + 0.13).fromTo('#m8d', { scale: 1 }, { scale: 0.9, duration: 0.06, yoyo: true, repeat: 1, immediateRender: false }, at(7) + 0.13); S('tap', at(7) + 0.13, { v: 6 });
  tl.fromTo('#m9x', { scale: 1 }, { scale: 0.82, duration: 0.06, yoyo: true, repeat: 1, immediateRender: false }, at(8) + 0.1).to('#m9t', { x: 900, opacity: 0, duration: 0.25, ease: 'power2.in' }, at(8) + 0.2); S('click', at(8) + 0.1, { v: 7 }); S('swipe', at(8) + 0.2, { d: 0.2 });
  tl.to('#m10a', { attr: { d: 'M6 6L18 18' }, duration: 0.2, ease: 'power2.out' }, at(9) + 0.1).to('#m10c', { attr: { d: 'M6 18L18 6' }, duration: 0.2, ease: 'power2.out' }, at(9) + 0.1).to('#m10b', { opacity: 0, duration: 0.1 }, at(9) + 0.1)
    .fromTo('#m10 .m10i', { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }, at(9) + 0.12); S('click', at(9) + 0.1, { v: 8 }); S('whooshSmall', at(9) + 0.12);
  LINE('#s17 .line', t + 1.6);
  VO.push({ id: 'vo1', t: t + 1.6, text: "The little things aren't little." });
}, { push: 0.02 });

// 18 · Performance — a rich page, scrolled fast, still smooth
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
  '<div class="btnP" style="height:104px;margin-top:30px;font-size:34px">Book your stay</div>',
].map((b) => `<div class="b18">${b}</div>`).join('');
scene(18, 4.8, (t) => {
  const SC = 2150; const t18 = t + 0.6; const d18 = 2.8;
  const ease18 = gsap.parseEase('power2.inOut');
  tl.to('#col18', { y: -SC, duration: d18, ease: 'power2.inOut' }, t18);
  S('scroll', t18, { d: d18 });
  $$('#col18 .b18').forEach((b) => {
    const top = b.offsetTop; if (top < 950) return;
    let te = t18 + d18;
    for (let k = 0; k <= 400; k++) { if (top - SC * ease18(k / 400) < 1000) { te = t18 + (d18 * k) / 400; break; } }
    tl.fromTo(b, { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out' }, te - 0.06);
  });
  tl.fromTo('#fps18', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.45 }, t + 0.5);
  LINE('#s18 .line', t + 2.2);
}, { push: 0.02 });

// 19 · Before / After
$('#s19 .cam').insertAdjacentHTML('beforeend', '<div class="abs lbl" style="left:110px;top:288px">Before</div><div class="abs lbl" style="right:110px;top:288px;color:#c4b5fd">After</div>');
const sl = { x: 540 };
const applySl = () => { $('#old19').style.clipPath = `inset(0 ${Math.max(0, 990 - sl.x)}px 0 0 round 34px)`; $('#sl19').style.left = `${sl.x}px`; };
applySl();
scene(19, 5.2, (t) => {
  tl.to(sl, { x: 720, duration: 0.9, ease: SM, onUpdate: applySl }, t + 0.8)
    .to(sl, { x: 90, duration: 1.4, ease: 'power3.inOut', onUpdate: applySl }, t + 2.0)
    .to('#sl19', { opacity: 0, duration: 0.35 }, t + 3.4);
  S('swipeSoft', t + 0.8, { d: 0.9 }); S('transform', t + 2.0, { d: 1.4 }); S('impactSoft', t + 3.42);
  LINE('#s19 .line', t + 3.2);
}, { push: 0.025 });

// 20 · The system → final reveal → logo
const eb = $('#ebtn').getBoundingClientRect();
const bx = eb.left + eb.width / 2; const by = eb.top + eb.height / 2;
gsap.set('#eco', { transformOrigin: `${bx}px ${by}px`, scale: 9, x: 540 - bx, y: 900 - by });
const eIn = [['#e1', 1.4, 0, -70], ['#e4', 1.75, -70, 0], ['#e6', 2.05, 70, 0], ['#e7', 2.3, 70, 40], ['#e3', 2.55, -70, 40], ['#e2', 2.8, 70, -60]];
eIn.forEach(([id]) => gsap.set(id, { opacity: 0 }));
gsap.set('#logoWord', { y: 12 }); gsap.set('#logoIcon', { scale: 0.94, filter: 'blur(8px)' });
scene(20, 8.4, (t) => {
  tl.to('#eco', { scale: 1, x: 0, y: 0, duration: 4.0, ease: 'power3.inOut' }, t + 0.3);
  S('rise', t + 0.25, { d: 4.3 });
  eIn.forEach(([id, o, dx, dy], i) => {
    tl.fromTo(id, { opacity: 0, x: dx, y: dy, scale: 0.92 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1.0, ease: 'expo.out' }, t + o);
    S('assemble', t + o + 0.15, { v: i });
  });
  tl.to('#eco', { scale: 0.9, y: -10, duration: 1.0, ease: SM, transformOrigin: '540px 900px' }, t + 4.35);
  S('settle', t + 4.4);
  tl.fromTo('#t20a', { opacity: 0, y: 26, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, t + 5.0)
    .fromTo('#t20b', { opacity: 0, y: 30, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, t + 5.9);
  VO.push({ id: 'vo2', t: t + 5.0, text: 'Not a website.' }, { id: 'vo3', t: t + 5.9, text: 'A complete digital experience.' });
  // end card follows straight after this scene
  const e = t + 8.4 + 0.2;
  tl.to('#endglow', { opacity: 1, duration: 1.1, ease: 'power2.out' }, e)
    .to('#logoIcon', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1 }, e + 0.15)
    .to('#logoWord', { opacity: 1, y: 0, duration: 1.0 }, e + 0.45)
    .set('#sweep', { opacity: 1 }, e + 0.6)
    .fromTo('#sweep i', { left: '-60%' }, { left: '130%', duration: 1.1, ease: 'power2.inOut' }, e + 0.6)
    .fromTo('#disc', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.9 }, e + 1.0)
    .fromTo('#url', { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, e + 1.4)
    .fromTo('#sign', { opacity: 0, y: 14, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0 }, e + 1.8)
    .to('#endglow', { opacity: 0.55, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: 1 }, e + 2.3)
    .to(['#logoIcon', '#logoWord', '#disc', '#url', '#sign'], { opacity: 0, duration: 1.0, ease: 'power2.inOut' }, e + 5.0)
    .to('#endglow', { opacity: 0, duration: 1.5, ease: 'power2.inOut' }, e + 4.8);
  S('impactFinal', e + 0.15); S('resonance', e + 0.17, { d: 5 });
  VO.push({ id: 'vo4', t: e + 1.8, text: 'We sweat the details — so your clients feel them.' });
  window.__duration = Math.round((e + 6.4) * 10) / 10;
}, { outTo: { y: 0, scale: 0.96 }, outDur: 0.6 });

// ── Assemble the timeline ────────────────────────────────────────────────────
let cursor = 0;
SCENES.forEach((sc, i) => {
  const a = i === 0 ? 0 : cursor - OV;
  const b = a + sc.dur;
  SHOW(sc.n, a, b, sc.opts);
  sc.build(a);
  cursor = b;
  sc.start = a;
});
const firstProduct = SCENES[1].start; const lastStart = SCENES[SCENES.length - 1].start;
tl.to('#bgGlow', { opacity: 1, duration: 0.8, ease: 'power2.out' }, firstProduct).to('#bgGlow', { opacity: 0, duration: 0.8, ease: 'power2.in' }, lastStart + 7.9);
S('ambience', firstProduct - 0.1, { d: lastStart + 8.6 - firstProduct });

window.__render = (t, frame) => {
  tl.seek(t, false);
  const r = (n) => ((Math.sin(frame * 12.9898 + n * 78.233) * 43758.5453) % 1);
  gsap.set('#grain', { x: r(1) * 60, y: r(2) * 60 });
};
window.__scenes = SCENES.map((s) => ({ n: s.n, start: Math.round(s.start * 100) / 100, dur: s.dur }));
window.__sfx = SFX.sort((a, b) => a.t - b.t);
window.__vo = VO;
window.__ready = document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
