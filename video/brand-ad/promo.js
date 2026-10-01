// MBN DEV — 30s trend promos. Three compositions selected by window.__DATA.id: "ai" | "tot" | "near".
// Same structure each time: hook 0–2.8 → eyebrow + visual story 3–26 → logo end card 26.6–30.
// Picture: one GSAP timeline seeked frame by frame (render.mjs). Sound: every beat registers a cue in
// window.__sfx; sfx.py turns the cue list into the mix (no music).
const D = Object.assign({ id: 'ai' }, window.__DATA || {});
gsap.defaults({ ease: 'expo.out' });
const SM = 'power3.inOut';
const tl = gsap.timeline({ paused: true });
const SFX = [];
const S = (type, t, o = {}) => SFX.push({ type, t: Math.round(t * 1000) / 1000, ...o });
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const scene = $('#scene');
const add = (html) => scene.insertAdjacentHTML('beforeend', html);
const WSET = { opacity: 0, y: 36, filter: 'blur(10px)' };

// "plain *highlighted words* plain" → word spans (the highlight can span several words)
const mk = (str) => { let on = false; return str.split(' ').map((tok) => { let h = on; if (tok.startsWith('*')) { on = true; tok = tok.slice(1); h = true; } if (tok.endsWith('*')) { tok = tok.slice(0, -1); on = false; h = true; } return `<span class="w${h ? ' hl' : ''}">${tok}</span>`; }).join(' '); };
const IN = (sel, t, x = {}) => tl.to(sel, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.07, ...x }, t);
const OUT = (sel, t, x = {}) => tl.to(sel, { opacity: 0, y: -36, filter: 'blur(10px)', duration: 0.4, ease: 'power2.in', stagger: 0, ...x }, t);
const svg = (d, c = '#fff', w = 40, sw = 2.4) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const CHK = '<path d="M5 12.5l4.5 4.5L19 7.5"/>';
const X = '<path d="M6 6l12 12M18 6L6 18"/>';
const IC = {
  menu: '<path d="M4 6h16M4 12h16M4 18h10"/>', star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
  rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2"/><path d="M9 15l-3-3c1-4 5-9 12-9 0 7-5 11-9 12z"/><circle cx="15" cy="9" r="1.5"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  chat: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/>', nav: '<path d="M3 11l18-8-8 18-2-8z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
};
function HEAD(id, str, a, b) {
  add(`<div id="${id}" class="abs head">${mk(str)}</div>`); gsap.set(`#${id} .w`, WSET);
  IN(`#${id} .w`, a); OUT(`#${id} .w`, b);
}
function TYPE(sel, text, t, d) {
  const el = $(sel); const o = { n: 0 };
  tl.to(o, { n: text.length, duration: d, ease: 'none', onUpdate() { el.textContent = text.slice(0, Math.round(o.n)); } }, t);
  for (let i = 0; i < text.length; i++) S('key', t + (d * (i + 0.5)) / text.length, { v: (i * 7919) % 17, space: text[i] === ' ' });
}
function COUNT(sel, a, b, t, d, fmt) {
  const el = $(sel); const o = { v: a };
  tl.to(o, { v: b, duration: d, ease: 'power2.out', onUpdate() { el.textContent = fmt(o.v); } }, t);
}
const PRESS = (sel, t, s = 0.95) => tl.to(sel, { scale: s, duration: 0.08, ease: 'power2.out' }, t).to(sel, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, t + 0.08);

function HOOK(lines) {
  add(`<div id="hook" class="abs">${lines.map((l) => `<div>${mk(l)}</div>`).join('')}</div>`); gsap.set('#hook .w', WSET);
  tl.to('#fade', { opacity: 0, duration: 0.4, ease: 'power2.out' }, 0).to('#ambient', { opacity: 0.8, duration: 1.4, ease: 'power2.out' }, 0.2);
  IN('#hook .w', 0.3, { stagger: 0.11 }); OUT('#hook .w', 2.5);
  S('texture', 0.05, { d: 2.6 }); S('impactSoft', 0.35); S('impact', 1.2);
  tl.to('#ambient', { opacity: 1, duration: 1.2 }, 2.9);
  tl.to('#eyebrow', { opacity: 1, duration: 0.6 }, 2.9);
}
function END(t, cta) {
  $('#cta').textContent = cta;
  gsap.set('#logoWord', { y: 12 }); gsap.set('#logoIcon', { scale: 0.94, filter: 'blur(8px)' });
  tl.to('#eyebrow', { opacity: 0, duration: 0.4, ease: 'power2.in' }, t - 0.1)
    .to('#ambient', { opacity: 0.35, duration: 0.8 }, t)
    .to('#endglow', { opacity: 1, duration: 1.0, ease: 'power2.out' }, t + 0.2)
    .to('#logoIcon', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9 }, t + 0.25)
    .to('#logoWord', { opacity: 1, y: 0, duration: 0.8 }, t + 0.45)
    .set('#sweep', { opacity: 1 }, t + 0.6)
    .fromTo('#sweep i', { left: '-60%' }, { left: '130%', duration: 0.9, ease: 'power2.inOut' }, t + 0.6)
    .fromTo('#cta', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, t + 0.95)
    .to('#url', { opacity: 1, duration: 0.7, ease: 'power2.out' }, t + 1.3)
    .to('#endglow', { opacity: 0.6, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t + 1.4);
  S('impactFinal', t + 0.3); S('resonance', t + 0.32, { d: 3.2 });
}

// ═══════════════ 1 · AI SEARCH ═══════════════
function compAI() {
  $('#eyebrow').textContent = 'Trend · AI search';
  HOOK(['Customers now', 'ask AI.', '*Will it name you?*']);
  const rowsDef = [['rw0', '1', 'Riad Amira', 'Rooftop pool, hammam, easy booking', '★ 4.8'], ['rw1', '2', 'Dar Nour', 'Quiet courtyard, near the souks', '★ 4.9'], ['rw2', '3', 'Riad Salam', 'Family-run, free breakfast', '★ 4.7']];
  add(`<div id="chat" class="abs glass" style="left:96px;top:690px;width:888px;height:870px;opacity:0">
    <div class="wh"><span class="av">AI</span><b>AI Assistant</b><em>online</em></div>
    <div id="ub" class="ub" style="opacity:0"><span id="ut"></span></div>
    <div id="th" class="th"><i></i><i></i><i></i></div>
    <div id="ans" class="ans"><div class="al">Here are the top picks in the Medina:</div><div class="rows">
      ${rowsDef.map(([id, n, name, why, st]) => `<div id="${id}" class="rw" style="opacity:0"><span class="n">${n}</span><div><b>${name}</b><em>${why}</em></div><span class="st">${st}</span></div>`).join('')}
      <div id="rwM" class="rw miss" style="opacity:0;top:354px"><span class="n">?</span><div><b>Your business</b><em>Not mentioned in the answer</em></div><span style="margin-left:auto">${svg(X, '#f87171', 34, 3)}</span></div>
      <div id="rwY" class="rw me" style="opacity:0"><span class="n">★</span><div><b>Your Riad</b><em>Clear pages · real reviews · fast site</em></div><span class="tag">RECOMMENDED</span></div>
    </div></div></div>`);
  [0, 1, 2].forEach((i) => gsap.set(`#rw${i}`, { y: i * 118 })); gsap.set('#rwY', { y: 0 }); gsap.set('#rwM', { y: 0 });
  // beat 1 · they ask
  HEAD('h1', 'They ask. *AI answers.*', 3.0, 8.3);
  tl.fromTo('#chat', { opacity: 0, y: 70, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.9 }, 3.0); S('glass', 3.0);
  tl.fromTo('#ub', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4 }, 3.6);
  TYPE('#ut', 'best riad in marrakech medina?', 3.8, 1.7);
  tl.to('#th', { opacity: 1, duration: 0.3 }, 5.7).fromTo('#th i', { y: 0 }, { y: -9, duration: 0.17, ease: 'sine.inOut', yoyo: true, repeat: 5, stagger: 0.08 }, 5.75).to('#th', { opacity: 0, duration: 0.2 }, 6.95);
  S('notifyMsg', 5.7);
  tl.to('#ans', { opacity: 1, duration: 0.3 }, 6.95);
  [7.1, 7.45, 7.8].forEach((t, i) => { tl.fromTo(`#rw${i}`, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.6 }, t); S('appear', t, { p: i }); });
  // beat 2 · you're missing
  HEAD('h2', "Your business isn't *in the answer.*", 8.5, 12.7);
  tl.fromTo('#rwM', { opacity: 0, x: 0 }, { opacity: 1, duration: 0.5 }, 8.9)
    .to('#rwM', { x: 12, duration: 0.07, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 9.45).to('#rwM', { x: 0, duration: 0.1 }, 9.9);
  S('hint', 8.9); S('pulse', 9.5);
  tl.to('#chat', { opacity: 0, y: -50, scale: 0.96, duration: 0.5, ease: 'power2.in' }, 12.9); S('whoosh', 12.9, { d: 0.4 });
  tl.set('#rwM', { opacity: 0 }, 13.5);
  // beat 3 · three fixes
  HEAD('h3', 'How to *get named.*', 13.8, 21.6);
  const fx = [['menu', 'Clear pages', 'Say what you do, where, and for whom.', 700], ['star', 'Real reviews & a full profile', 'Photos, hours, map and honest reviews.', 944], ['rocket', 'A fast, mobile-friendly site', 'Clean structure that is easy to read.', 1188]];
  fx.forEach(([ic, t, s, top], i) => {
    add(`<div id="fc${i}" class="fc glass" style="top:${top}px"><span class="ic">${svg(IC[ic], '#c4b5fd', 46, 2)}</span><div><b>${t}</b><em>${s}</em></div><span class="ck"><i></i>${svg(CHK, '#fff', 36, 3.4)}</span></div>`);
    const a = 14.3 + i * 2.15;
    tl.fromTo(`#fc${i}`, { opacity: 0, y: 60, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, a); S('appear', a, { p: i + 2 });
    tl.to(`#fc${i} .ck i`, { opacity: 1, duration: 0.25, ease: 'power2.out' }, a + 0.95).to(`#fc${i} .ck svg`, { opacity: 1, duration: 0.2 }, a + 1.0)
      .to(`#fc${i}`, { borderColor: 'rgba(168,85,247,0.7)', duration: 0.3 }, a + 0.95);
    PRESS(`#fc${i} .ck`, a + 0.95, 0.85); S('confirmSoft', a + 0.97, { v: i });
  });
  tl.to('.fc', { opacity: 0, y: -40, duration: 0.4, ease: 'power2.in', stagger: 0.05 }, 21.7);
  // beat 4 · now you're the answer
  HEAD('h4', "Now you're *the answer.*", 22.8, 26.3);
  tl.fromTo('#chat', { opacity: 0, y: 50, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, immediateRender: false }, 22.6); S('glass', 22.65);
  [1, 2, 0].forEach((i, k) => tl.to(`#rw${i}`, { y: (i + 1) * 118, duration: 0.7, ease: SM }, 23.5 + k * 0.05));
  tl.fromTo('#rwY', { opacity: 0, y: -30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 23.7).fromTo('#rwY', { boxShadow: '0 0 90px rgba(168,85,247,0.8)' }, { boxShadow: '0 0 50px rgba(124,58,237,0.4)', duration: 1.4, ease: 'power2.out' }, 23.8);
  S('confirmDeep', 23.7);
  tl.to('#chat', { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, 26.2);
  END(26.6, 'Be the answer.');
}

// ═══════════════ 2 · THIS OR THAT ═══════════════
function compTOT() {
  $('#eyebrow').textContent = 'This or that · website edition';
  HOOK(['This or That?', '*Website edition.*']);
  const R = [
    ['Speed.', 'Loads in 9 seconds', 'Loads in 0.8 seconds', "Visitors don't wait."],
    ['Ownership.', 'An Instagram page only', 'Your own website', 'You rent a page. You own a website.'],
    ['Contact.', 'A form with 9 fields', 'WhatsApp in one tap', 'One tap beats nine fields.'],
    ['Identity.', 'The same template as everyone', 'A design made for your brand', 'Be remembered, not repeated.'],
    ['Care.', 'Built once, then forgotten', 'Updated and backed up monthly', "A website is never 'done'."],
  ];
  add('<div id="trk" class="abs trk"><i id="trkf"></i></div>');
  add(`<div id="dots" class="abs">${R.map((_, i) => `<i id="dot${i}"></i>`).join('')}</div>`);
  tl.to('#dots', { opacity: 1, duration: 0.5 }, 3.0);
  R.forEach(([topic, a, b, why], i) => {
    const t0 = 3.0 + i * 4.1; const r = t0 + 2.5;
    add(`<div id="oa${i}" class="opt glass" style="top:750px"><span class="lt">A</span><span class="tx">${a}</span><span class="mk n">${svg(X, '#fff', 40, 3.6)}</span></div>
         <div id="ob${i}" class="opt glass" style="top:1080px"><span class="lt">B</span><span class="tx">${b}</span><span class="mk y">${svg(CHK, '#fff', 40, 3.6)}</span></div>
         <div id="why${i}" class="abs" style="left:96px;width:888px;top:1425px;text-align:center;font-size:44px;font-weight:700;letter-spacing:-0.02em;color:#fff;opacity:0">${why}</div>`);
    HEAD(`hr${i}`, `Round ${i + 1} · *${topic}*`, t0, t0 + 3.85);
    tl.fromTo(`#oa${i}`, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6 }, t0 + 0.05).fromTo(`#ob${i}`, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6 }, t0 + 0.2);
    S('appear', t0 + 0.05, { p: 0 }); S('appear', t0 + 0.2, { p: 2 });
    tl.set('#trkf', { scaleX: 1 }, t0 + 0.4).to('#trk', { opacity: 1, duration: 0.2 }, t0 + 0.4).to('#trkf', { scaleX: 0, duration: 1.9, ease: 'none' }, t0 + 0.5);
    [0.7, 1.2, 1.7, 2.2].forEach((o, k) => S('tick', t0 + o, { v: k }));
    // reveal: B wins
    tl.to(`#oa${i}`, { opacity: 0.35, scale: 0.97, duration: 0.4 }, r).to(`#oa${i} .mk`, { opacity: 1, duration: 0.3 }, r)
      .to(`#ob${i}`, { scale: 1.025, borderColor: 'rgba(168,85,247,0.9)', background: 'linear-gradient(180deg, rgba(124,58,237,0.32), rgba(124,58,237,0.12))', boxShadow: '0 0 70px rgba(168,85,247,0.5)', duration: 0.4 }, r)
      .to(`#ob${i} .lt`, { background: 'linear-gradient(135deg,#a855f7,#6d28d9)', borderColor: 'transparent', duration: 0.3 }, r)
      .fromTo(`#ob${i} .mk`, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(3)' }, r)
      .to('#trk', { opacity: 0, duration: 0.2 }, r)
      .to(`#dot${i}`, { backgroundColor: '#a855f7', borderColor: '#c4b5fd', boxShadow: '0 0 20px rgba(168,85,247,0.8)', scale: 1.15, duration: 0.3 }, r)
      .fromTo(`#why${i}`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, r + 0.2);
    S('confirm', r); S('pop', r + 0.25);
    tl.to([`#oa${i}`, `#ob${i}`, `#why${i}`], { opacity: 0, y: -40, duration: 0.3, ease: 'power2.in' }, t0 + 3.85);
  });
  add(`<div id="score" class="abs">${mk('Score your')}<br/>${mk('own *website.*')}</div><div id="scoreSub" class="abs" style="opacity:0">How many would it pick? Be honest.</div>`);
  gsap.set('#score .w', WSET);
  IN('#score .w', 23.7); OUT('#score .w', 26.2);
  tl.fromTo('#scoreSub', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 24.6).to('#scoreSub', { opacity: 0, duration: 0.3 }, 26.2);
  tl.to('#dots', { y: -180, duration: 0.6, ease: SM }, 23.6).fromTo('#dots i', { scale: 1 }, { scale: 1.35, duration: 0.2, yoyo: true, repeat: 1, stagger: 0.08 }, 24.0).to('#dots', { opacity: 0, duration: 0.3 }, 26.2);
  S('whooshSmall', 23.6); S('settle', 23.7);
  END(26.6, 'Make the right pick.');
}

// ═══════════════ 3 · NEAR ME ═══════════════
function compNear() {
  $('#eyebrow').textContent = 'Trend · local search';
  HOOK(['Someone nearby', 'is searching', '*right now.*']);
  const pin = (id, x, y, c) => `<svg id="${id}" class="pin" style="left:${x}px;top:${y}px" viewBox="0 0 64 64"><path d="M32 62C32 62 6 38 6 24a26 26 0 1 1 52 0c0 14-26 38-26 38z" fill="${c}"/><circle cx="32" cy="24" r="10" fill="#fff"/></svg>`;
  add(`<div id="sb" class="abs glass">${svg(IC.search, '#c4b5fd', 44, 2.4)}<span id="st"></span><i class="caret"></i></div>
    <div id="map" class="abs">
      <svg viewBox="0 0 888 340" preserveAspectRatio="none"><g stroke="rgba(255,255,255,0.06)" stroke-width="2"><path d="M0 70H888M0 170H888M0 270H888M150 0V340M370 0V340M590 0V340M790 0V340"/></g>
        <path d="M-20 300L300 180L560 220L920 60" fill="none" stroke="rgba(168,85,247,0.28)" stroke-width="14" stroke-linecap="round"/><path d="M-20 300L300 180L560 220L920 60" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2" stroke-dasharray="14 12"/>
        <rect x="620" y="40" width="130" height="80" rx="14" fill="rgba(52,211,153,0.09)"/><rect x="60" y="200" width="150" height="90" rx="14" fill="rgba(59,130,246,0.08)"/></svg>
      ${pin('p1', 230, 150, '#7c8cff')}${pin('p2', 470, 110, '#7c8cff')}${pin('p3', 690, 210, '#7c8cff')}
      <div id="ghost" class="abs" style="left:368px;top:150px;width:64px;height:64px;border-radius:50%;border:3px dashed rgba(248,113,113,0.8);display:grid;place-items:center;font-size:36px;font-weight:900;color:#fca5a5;opacity:0">?</div>
      <i id="ring" class="ring" style="left:400px;top:200px"></i>${pin('py', 400, 200, '#a855f7')}
    </div>
    <div id="res" class="abs">
      <div id="nr0" class="rw" style="opacity:0"><span class="n">1</span><div><b>Riad Amira</b><em>0.3 km · Open now</em></div><span class="st">★ 4.8</span></div>
      <div id="nr1" class="rw" style="opacity:0"><span class="n">2</span><div><b>Dar Nour</b><em>0.5 km · Open now</em></div><span class="st">★ 4.9</span></div>
      <div id="nr2" class="rw" style="opacity:0"><span class="n">3</span><div><b>Riad Salam</b><em>0.7 km · Closes 22:00</em></div><span class="st">★ 4.7</span></div>
      <div id="nrM" class="rw miss" style="opacity:0"><span class="n">?</span><div><b>Your riad</b><em>Not listed nearby</em></div><span style="margin-left:auto">${svg(X, '#f87171', 34, 3)}</span></div>
      <div id="nrY" class="rw me" style="opacity:0"><span class="n">★</span><div><b>Your Riad</b><em>0.2 km · Open now</em></div><span class="tag">★ 4.9</span></div>
    </div>
    <div id="prof" class="abs glass"><div id="pimg"></div>
      <div id="pname"><b>Your Riad</b><em>Riad · Marrakech Medina</em></div>
      <div id="phours">${svg(CHK, '#6ee7b7', 30, 3)}Open now · until 22:00</div>
      <div id="pbtn"><span>${svg(IC.phone, '#fff', 32, 2)}Call</span><span class="wa">${svg(IC.chat, '#052e16', 32, 2.2)}WhatsApp</span><span>${svg(IC.nav, '#fff', 32, 2)}Directions</span><span>${svg(IC.globe, '#fff', 32, 2)}Website</span></div>
      <div id="prev"><div class="big"><b id="rate">0.0</b><span class="stars">${'<i style="font-style:normal;opacity:0;display:inline-block">★</i>'.repeat(5)}</span></div><div class="cnt"><span id="rc">0</span> reviews</div><div class="q">“The most beautiful stay of our trip.”</div></div>
    </div>`);
  [0, 1, 2].forEach((i) => gsap.set(`#nr${i}`, { y: i * 106 })); gsap.set('#nrM', { y: 318 }); gsap.set('#nrY', { y: 0 });
  HEAD('h1', 'Someone nearby *is searching.*', 3.0, 8.3);
  tl.fromTo(['#sb', '#map'], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 3.0).to('#res', { opacity: 1, duration: 0.2 }, 5.5); S('glass', 3.0);
  TYPE('#st', 'riad near me', 3.8, 1.2);
  tl.to('#sb .caret', { opacity: 0, duration: 0.01, repeat: 9, yoyo: true, repeatDelay: 0.3 }, 3.0);
  ['p1', 'p2', 'p3'].forEach((p, i) => { tl.fromTo(`#${p}`, { opacity: 0, y: -90 }, { opacity: 1, y: 0, duration: 0.55, ease: 'bounce.out' }, 5.2 + i * 0.22); S('pop', 5.35 + i * 0.22); });
  [5.9, 6.25, 6.6].forEach((t, i) => { tl.fromTo(`#nr${i}`, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.6 }, t); S('appear', t, { p: i }); });
  HEAD('h2', "Your riad *isn't on the map.*", 8.5, 12.7);
  tl.fromTo('#ghost', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(3)' }, 8.8).to('#ghost', { scale: 1.12, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 9.4)
    .fromTo('#nrM', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 9.0);
  S('hint', 8.8); S('pulse', 9.4);
  tl.to(['#sb', '#map', '#res'], { opacity: 0, y: -40, duration: 0.45, ease: 'power2.in', stagger: 0.05 }, 12.9); S('whoosh', 12.9, { d: 0.4 });
  tl.set('#ghost', { opacity: 0 }, 13.5).set('#nrM', { opacity: 0 }, 13.5);
  // profile builds in three beats
  tl.fromTo('#prof', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8 }, 13.8); S('glass', 13.8);
  HEAD('h3', 'A complete *profile.*', 14.0, 16.5); HEAD('h4', 'Easy ways *to reach you.*', 16.8, 19.3); HEAD('h5', 'Real *reviews.*', 19.6, 22.2);
  tl.fromTo('#pimg', { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.0 }, 14.4).fromTo('#pname', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 14.9); S('appear', 14.4, { p: 1 }); S('appear', 14.9, { p: 3 });
  tl.fromTo('#phours', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 17.0); S('confirmSoft', 17.1, { v: 0 });
  $$('#pbtn span').forEach((b, i) => { tl.fromTo(b, { opacity: 0, y: 30, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.55 }, 17.5 + i * 0.22); S('tap', 17.6 + i * 0.22, { v: i }); });
  tl.fromTo('#prev', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 19.8);
  COUNT('#rate', 0, 4.9, 20.0, 1.2, (v) => v.toFixed(1)); COUNT('#rc', 0, 128, 20.0, 1.5, (v) => String(Math.round(v)));
  $$('#prev .stars i').forEach((s, i) => { tl.fromTo(s, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(3)' }, 20.1 + i * 0.14); S('tick', 20.15 + i * 0.14, { v: i }); });
  tl.fromTo('#prev .q', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 21.4); S('confirm', 21.4);
  tl.to('#prof', { opacity: 0, y: -40, duration: 0.45, ease: 'power2.in' }, 22.3);
  // back to the map: you're the first result
  HEAD('h6', 'Now they *find you.*', 22.9, 26.3);
  tl.fromTo(['#sb', '#map', '#res'], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, immediateRender: false }, 22.7); S('glass', 22.75);
  tl.fromTo('#py', { opacity: 0, y: -100 }, { opacity: 1, y: 0, duration: 0.6, ease: 'bounce.out' }, 23.5).fromTo('#ring', { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 2.2, duration: 1.0, ease: 'power2.out', repeat: 1 }, 23.9);
  S('pop', 23.65); S('confirmDeep', 23.9);
  [2, 1, 0].forEach((i, k) => tl.to(`#nr${i}`, { y: (i + 1) * 106, duration: 0.7, ease: SM }, 24.0 + k * 0.05));
  tl.fromTo('#nrY', { opacity: 0, y: -30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 24.15).fromTo('#nrY', { boxShadow: '0 0 90px rgba(168,85,247,0.8)' }, { boxShadow: '0 0 50px rgba(124,58,237,0.4)', duration: 1.2, ease: 'power2.out' }, 24.2);
  tl.to(['#sb', '#map', '#res'], { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, 26.2);
  END(26.6, 'Be the one they find.');
}

({ ai: compAI, tot: compTOT, near: compNear })[D.id]();
S('ambience', 2.8, { d: 23.6 });
window.__render = (t, frame) => {
  tl.seek(t, false);
  const r = (n) => ((Math.sin(frame * 12.9898 + n * 78.233) * 43758.5453) % 1);
  gsap.set('#grain', { x: r(1) * 60, y: r(2) * 60 });
};
window.__duration = 30;
window.__sfx = SFX.sort((a, b) => a.t - b.t);
window.__vo = [];
window.__ready = document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
