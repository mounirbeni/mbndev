// Vector art for TARZ: busts (haircut illustrations), tools, grooming products and the hero pole.
// Drawn in code so the demo looks finished before any photo is added.

const SKIN = '#e2bf9b';
const HAIR = '#16110d';
const SHIRT = '#26332f';

// Hair / beard layers on a shared head so every cut is comparable at a glance.
const HAIRS = {
  classic: `<path d="M36 54C33 30 47 22 62 22c19 0 28 13 23 32-4-9-10-15-23-15-11 0-19 5-26 15Z" fill="${HAIR}"/><path d="M52 24c-2 5-2 9 0 13" stroke="${SKIN}" stroke-width="1.6" fill="none" opacity=".55"/>`,
  fade: `<path d="M39 46c-1-17 11-25 22-25 12 0 21 8 20 25-6-7-12-11-21-11s-14 4-21 11Z" fill="${HAIR}"/><path d="M38 52c0-5 1-8 3-10M82 52c0-5-1-8-3-10" stroke="${HAIR}" stroke-width="7" stroke-linecap="round" opacity=".22" fill="none"/><path d="M39 58c0-4 0-6 1-8M81 58c0-4 0-6-1-8" stroke="${HAIR}" stroke-width="5" stroke-linecap="round" opacity=".12" fill="none"/>`,
  taper: `<path d="M38 50c-3-17 7-30 22-30 6 0 8-3 12-1 4-2 9 1 10 6 4 3 4 12 1 25-4-9-10-15-24-15-9 0-15 5-21 15Z" fill="${HAIR}"/><path d="M40 60c0-5 0-8 1-10M80 60c0-5 0-8-1-10" stroke="${HAIR}" stroke-width="5" stroke-linecap="round" opacity=".2" fill="none"/>`,
  buzz: `<path d="M38 47C38 31 50 26 60 26s22 5 22 21c-6-9-13-13-22-13s-16 4-22 13Z" fill="${HAIR}" opacity=".55"/>`,
  scissor: `<path d="M34 58C30 30 46 20 62 20c19 0 31 12 25 40 0 14 3 24 2 33H79c-2-12 0-22 0-33-2-15-9-23-19-23s-17 8-19 23c0 11 2 21 0 33H31c-1-9 3-19 3-35Z" fill="${HAIR}"/>`,
  grey: `<path d="M36 54C33 30 47 22 62 22c19 0 28 13 23 32-4-9-10-15-23-15-11 0-19 5-26 15Z" fill="#9aa0a4"/><path d="M42 46c4-8 10-12 20-12M70 36c6 2 10 7 12 14" stroke="#d6d9db" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M38 50c2-6 4-9 8-11" stroke="${HAIR}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>`,
  kids: `<path d="M41 47c-3-14 6-23 19-23s23 9 19 23c-4-4-9-8-14-6-5-3-12-1-24 6Z" fill="${HAIR}"/>`,
};
const BEARD = `<path d="M38 60c0 24 11 34 22 34s22-10 22-34c-4 9-11 14-22 14S42 69 38 60Z" fill="${HAIR}"/><path d="M52 78c5 2 11 2 16 0" stroke="${SKIN}" stroke-width="2" stroke-linecap="round" fill="none"/>`;
const STUBBLE = `<path d="M40 62c1 18 10 27 20 27s19-9 20-27c-4 8-11 12-20 12s-16-4-20-12Z" fill="${HAIR}" opacity=".28"/>`;

/** A head-and-shoulders illustration. kind: classic | fade | taper | buzz | scissor | kids | beard | combo */
export function bust(kind = 'classic', { bg = true } = {}) {
  const hair = kind === 'beard' ? HAIRS.classic : kind === 'combo' ? HAIRS.classic : HAIRS[kind] || HAIRS.classic;
  const beard = kind === 'beard' || kind === 'combo' ? BEARD : kind === 'fade' || kind === 'taper' ? STUBBLE : '';
  const scale = kind === 'kids' ? 'transform="translate(9 13) scale(.85)"' : '';
  return `<svg class="art bust" viewBox="0 0 120 120" aria-hidden="true">
    ${bg ? '<circle cx="60" cy="60" r="56" fill="rgba(201,162,77,.10)"/><circle cx="60" cy="60" r="56" fill="none" stroke="rgba(201,162,77,.35)" stroke-width="1.2"/>' : ''}
    <g ${scale}>
      <path d="M18 120c3-19 22-27 42-27s39 8 42 27Z" fill="${SHIRT}"/>
      <path d="M48 94l12 12 12-12" fill="#f1ebe0" opacity=".9"/>
      <rect x="52" y="76" width="16" height="22" rx="6" fill="${SKIN}"/>
      <ellipse cx="38" cy="58" rx="4" ry="6" fill="${SKIN}"/><ellipse cx="82" cy="58" rx="4" ry="6" fill="${SKIN}"/>
      <ellipse cx="60" cy="56" rx="22" ry="28" fill="${SKIN}"/>
      ${hair}${beard}
      <circle cx="51" cy="56" r="1.8" fill="${HAIR}"/><circle cx="69" cy="56" r="1.8" fill="${HAIR}"/>
      <path d="M${kind === 'kids' ? '53 70c4 4 10 4 14 0' : '54 71c4 2 8 2 12 0'}" stroke="${kind === 'beard' || kind === 'combo' ? SKIN : '#a5694a'}" stroke-width="2" stroke-linecap="round" fill="none"/>
    </g>
  </svg>`;
}

const wrap = (inner) => `<svg class="art tool" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="rgba(201,162,77,.10)"/><circle cx="60" cy="60" r="56" fill="none" stroke="rgba(201,162,77,.35)" stroke-width="1.2"/>${inner}</svg>`;
const B = 'var(--brass)';

const TOOLS = {
  shave: wrap(`<g transform="rotate(-35 60 60)"><rect x="14" y="52" width="64" height="12" rx="2" fill="#d8dcd9"/><path d="M14 52h64l-6 6H20Z" fill="#fff" opacity=".55"/><rect x="78" y="54" width="28" height="8" rx="4" fill="#2a1f16"/><circle cx="74" cy="58" r="3" fill="${B}"/><circle cx="14" cy="58" r="4" fill="${B}"/></g><path d="M22 92c8-6 14 4 22-2s14 4 22-2" stroke="${B}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`),
  crown: wrap(`<path d="M28 80l-6-30 20 14 18-26 18 26 20-14-6 30Z" fill="${B}"/><rect x="28" y="84" width="64" height="8" rx="3" fill="${B}" opacity=".7"/><circle cx="60" cy="34" r="4" fill="var(--red)"/><circle cx="22" cy="48" r="3.4" fill="#f1ebe0"/><circle cx="98" cy="48" r="3.4" fill="#f1ebe0"/>`),
  care: wrap(`<path d="M60 22c14 20 24 32 24 46a24 24 0 0 1-48 0c0-14 10-26 24-46Z" fill="none" stroke="${B}" stroke-width="3.4" stroke-linejoin="round"/><path d="M48 70a12 12 0 0 0 10 12" stroke="#f1ebe0" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M92 28v10M87 33h10M24 88v8M20 92h8" stroke="${B}" stroke-width="2.6" stroke-linecap="round"/>`),
  mask: wrap(`<ellipse cx="60" cy="62" rx="26" ry="34" fill="#2a2f2d" stroke="${B}" stroke-width="3"/><path d="M43 56c4-5 9-5 13 0M64 56c4-5 9-5 13 0" stroke="${B}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M52 78c5 3 11 3 16 0" stroke="${B}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M96 30v10M91 35h10M22 92v8M18 96h8" stroke="${B}" stroke-width="2.6" stroke-linecap="round"/>`),
  wash: wrap(`<path d="M40 30c10 14 16 22 16 30a16 16 0 0 1-32 0c0-8 6-16 16-30Z" fill="none" stroke="${B}" stroke-width="3.2" stroke-linejoin="round"/><path d="M82 48c7 10 11 15 11 21a11 11 0 0 1-22 0c0-6 4-11 11-21Z" fill="${B}" opacity=".85"/><circle cx="70" cy="88" r="5" fill="none" stroke="#f1ebe0" stroke-width="2.4"/><circle cx="52" cy="94" r="3.4" fill="none" stroke="#f1ebe0" stroke-width="2.4"/><circle cx="88" cy="26" r="3" fill="#f1ebe0"/>`),
  scissors: wrap(`<g transform="rotate(-30 60 60)"><circle cx="36" cy="82" r="11" fill="none" stroke="${B}" stroke-width="4"/><circle cx="84" cy="82" r="11" fill="none" stroke="${B}" stroke-width="4"/><path d="M42 74L78 20M78 74L42 20" stroke="#e8ece9" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="48" r="3.4" fill="${B}"/></g>`),
};
const KEY = { classic: 'classic', fade: 'fade', taper: 'taper', buzz: 'buzz', scissor: 'scissor', beard: 'beard', combo: 'combo', kids: 'kids', grey: 'grey' };
export const serviceArt = (key) => (KEY[key] ? bust(KEY[key]) : TOOLS[key] || TOOLS.scissors);
export const styleArt = (key) => (KEY[key] ? bust(KEY[key]) : TOOLS.scissors);

/** Grooming product silhouettes tinted per product. */
export function productArt(kind, tint = '#c9a24d') {
  const lid = '#d9d5cc';
  const shapes = {
    jar: `<ellipse cx="60" cy="96" rx="34" ry="8" fill="rgba(0,0,0,.35)"/><rect x="26" y="52" width="68" height="42" rx="8" fill="${tint}"/><rect x="24" y="40" width="72" height="16" rx="6" fill="${lid}"/><rect x="38" y="64" width="44" height="18" rx="3" fill="rgba(255,255,255,.88)"/><path d="M44 71h32M44 76h20" stroke="#16110d" stroke-width="2" stroke-linecap="round"/>`,
    tin: `<ellipse cx="60" cy="92" rx="38" ry="8" fill="rgba(0,0,0,.35)"/><rect x="24" y="58" width="72" height="32" rx="6" fill="${tint}"/><ellipse cx="60" cy="58" rx="36" ry="9" fill="${lid}"/><ellipse cx="60" cy="58" rx="30" ry="6" fill="rgba(0,0,0,.18)"/><rect x="36" y="70" width="48" height="12" rx="2" fill="rgba(255,255,255,.88)"/>`,
    bottle: `<ellipse cx="60" cy="102" rx="26" ry="6" fill="rgba(0,0,0,.35)"/><rect x="50" y="14" width="20" height="16" rx="3" fill="#2a2a2a"/><rect x="46" y="28" width="28" height="10" rx="3" fill="${lid}"/><rect x="36" y="38" width="48" height="64" rx="12" fill="${tint}"/><rect x="42" y="56" width="36" height="28" rx="3" fill="rgba(255,255,255,.88)"/><path d="M47 66h26M47 72h16" stroke="#16110d" stroke-width="2" stroke-linecap="round"/>`,
    dropper: `<ellipse cx="60" cy="102" rx="24" ry="6" fill="rgba(0,0,0,.35)"/><path d="M52 10c0-4 16-4 16 0v22H52Z" fill="#2a2a2a"/><rect x="50" y="30" width="20" height="10" rx="2" fill="${lid}"/><rect x="38" y="40" width="44" height="62" rx="10" fill="${tint}" opacity=".95"/><rect x="43" y="58" width="34" height="26" rx="3" fill="rgba(255,255,255,.88)"/><path d="M48 68h24M48 74h14" stroke="#16110d" stroke-width="2" stroke-linecap="round"/>`,
    comb: `<ellipse cx="60" cy="98" rx="40" ry="6" fill="rgba(0,0,0,.3)"/><rect x="14" y="40" width="92" height="22" rx="8" fill="${tint}"/>${Array.from({ length: 15 }, (_, i) => `<rect x="${19 + i * 6}" y="60" width="2.6" height="26" rx="1.3" fill="${tint}"/>`).join('')}<rect x="14" y="40" width="92" height="6" rx="3" fill="rgba(255,255,255,.18)"/>`,
  };
  return `<svg class="art prod" viewBox="0 0 120 120" aria-hidden="true">${shapes[kind] || shapes.jar}</svg>`;
}

/** The hero: a rotating barber pole inside a ring of text. */
export function heroArt() {
  return `<svg class="hero-svg" viewBox="0 0 400 460" aria-hidden="true">
    <defs>
      <pattern id="stripes" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
        <rect width="48" height="48" fill="#f4efe6"/><rect width="16" height="48" fill="#b3262e"/><rect x="32" width="16" height="48" fill="#1f3f73"/>
        <animateTransform attributeName="patternTransform" type="translate" additive="sum" from="0 0" to="0 48" dur="2.4s" repeatCount="indefinite"/>
      </pattern>
      <linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".3" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
      <path id="ring" d="M200 230m-170 0a170 170 0 1 1 340 0a170 170 0 1 1-340 0"/>
    </defs>
    <circle cx="200" cy="230" r="196" fill="none" stroke="rgba(201,162,77,.28)" stroke-width="1.4"/>
    <circle cx="200" cy="230" r="150" fill="rgba(201,162,77,.06)"/>
    <text class="ring-text" fill="var(--brass)"><textPath href="#ring" startOffset="0">BARBER CLUB • AGDAL RABAT • FADES • BEARDS • HOT TOWEL SHAVES • SINCE 2019 • </textPath></text>
    <rect x="156" y="64" width="88" height="22" rx="10" fill="var(--brass)"/><rect x="146" y="82" width="108" height="14" rx="6" fill="#d8b866"/>
    <rect x="164" y="94" width="72" height="272" fill="url(#stripes)"/>
    <rect x="164" y="94" width="72" height="272" fill="url(#glass)"/>
    <rect x="146" y="364" width="108" height="14" rx="6" fill="#d8b866"/><rect x="156" y="376" width="88" height="22" rx="10" fill="var(--brass)"/>
    <g transform="translate(286 318) rotate(-24) scale(.78)" opacity=".95"><circle cx="-14" cy="34" r="12" fill="none" stroke="var(--brass)" stroke-width="4"/><circle cx="14" cy="34" r="12" fill="none" stroke="var(--brass)" stroke-width="4"/><path d="M-9 24L16-34M9 24L-16-34" stroke="#e8ece9" stroke-width="5" stroke-linecap="round"/></g>
    <g transform="translate(110 330) rotate(20) scale(.8)" opacity=".9"><rect x="-44" y="-6" width="64" height="12" rx="2" fill="#d8dcd9"/><rect x="18" y="-4" width="30" height="8" rx="4" fill="#2a1f16"/><circle cx="-44" cy="0" r="4" fill="var(--brass)"/></g>
  </svg>`;
}

/** Five stars, filled up to `n` (supports halves visually via opacity). */
export const stars = (n) => Array.from({ length: 5 }, (_, i) => `<svg class="star ${i + 1 <= Math.round(n) ? 'on' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9Z"/></svg>`).join('');
