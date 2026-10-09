// Vector art for LALLA: service illustrations, product silhouettes and the hero arch.
// Drawn in code so the demo looks finished before any photo is added.

const wrap = (inner) => `<svg class="art tool" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="rgba(194,108,127,.10)"/><circle cx="60" cy="60" r="56" fill="none" stroke="rgba(194,108,127,.38)" stroke-width="1.2"/>${inner}</svg>`;
const R = 'var(--rose)';
const P = 'var(--plum)';
const G = 'var(--gold)';

const ART = {
  hair: wrap(`<path d="M40 88c-10-14-8-38 6-50 10-9 26-9 34 2 9 12 6 34-4 48" fill="none" stroke="${P}" stroke-width="3.4" stroke-linecap="round"/><path d="M52 40c-4 16 0 32 8 48M62 36c-2 18 2 36 10 52M44 52c-2 12 0 24 6 34" fill="none" stroke="${R}" stroke-width="3" stroke-linecap="round"/><path d="M90 30l4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill="${G}"/>`),
  colour: wrap(`<path d="M38 40c4-10 14-14 22-14s18 4 22 14c2 8-2 14-4 20-2 10 0 18-4 28H46c-4-10-2-18-4-28-2-6-6-12-4-20Z" fill="none" stroke="${P}" stroke-width="3.2" stroke-linejoin="round"/><path d="M48 44c6 12 10 24 8 42M60 40c4 14 6 28 4 46M72 44c-2 12-2 26 0 42" stroke="${R}" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M60 32c6 2 12 8 14 16" stroke="${G}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`),
  treat: wrap(`<rect x="38" y="52" width="44" height="40" rx="8" fill="none" stroke="${P}" stroke-width="3.2"/><rect x="34" y="40" width="52" height="16" rx="6" fill="${R}" opacity=".85"/><path d="M48 70c4-4 8 4 12 0s8 4 12 0" stroke="${G}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M96 28v10M91 33h10" stroke="${G}" stroke-width="2.6" stroke-linecap="round"/>`),
  nails: wrap(`<path d="M44 90V54c0-4 2-6 5-6s5 2 5 6v-12c0-4 2-6 5-6s5 2 5 6v4c0-4 2-6 5-6s5 2 5 6v38" fill="none" stroke="${P}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 90c0 8 6 12 14 12h8c8 0 14-4 14-12v-8" fill="none" stroke="${P}" stroke-width="3.2" stroke-linecap="round"/><rect x="47" y="30" width="6" height="9" rx="3" fill="${R}"/><rect x="56" y="24" width="6" height="9" rx="3" fill="${R}"/><rect x="65" y="28" width="6" height="9" rx="3" fill="${R}"/>`),
  feet: wrap(`<path d="M50 28c-6 10-8 24-4 38 3 10 2 18-2 24 8 6 24 4 28-6 3-8-2-16-4-24-3-12 0-26-6-34-4-4-10-4-12 2Z" fill="none" stroke="${P}" stroke-width="3.2" stroke-linejoin="round"/><circle cx="66" cy="30" r="3.6" fill="${R}"/><circle cx="74" cy="36" r="3.2" fill="${R}"/><circle cx="79" cy="45" r="2.8" fill="${R}"/><path d="M32 94c8-6 14 4 22-2s14 4 22-2" stroke="${G}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`),
  skin: wrap(`<path d="M60 22c14 20 24 32 24 46a24 24 0 0 1-48 0c0-14 10-26 24-46Z" fill="none" stroke="${P}" stroke-width="3.4" stroke-linejoin="round"/><path d="M48 70a12 12 0 0 0 10 12" stroke="${R}" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M92 28v10M87 33h10M24 88v8M20 92h8" stroke="${G}" stroke-width="2.6" stroke-linecap="round"/>`),
  spa: wrap(`<path d="M60 26c8 10 12 20 10 30M60 26c-8 10-12 20-10 30" fill="none" stroke="${R}" stroke-width="3.4" stroke-linecap="round"/><path d="M60 36c14 2 26 12 28 28-12 2-24-2-28-12-4 10-16 14-28 12 2-16 14-26 28-28Z" fill="none" stroke="${P}" stroke-width="3.2" stroke-linejoin="round"/><ellipse cx="46" cy="86" rx="12" ry="5" fill="${G}" opacity=".85"/><ellipse cx="66" cy="90" rx="16" ry="6" fill="${P}" opacity=".7"/><ellipse cx="82" cy="84" rx="9" ry="4" fill="${R}" opacity=".8"/>`),
  massage: wrap(`<path d="M30 82c10-14 24-14 36-8 10 4 16 2 24-6" fill="none" stroke="${P}" stroke-width="3.2" stroke-linecap="round"/><circle cx="46" cy="52" r="9" fill="none" stroke="${P}" stroke-width="3.2"/><path d="M40 62c4 6 14 8 22 4" fill="none" stroke="${P}" stroke-width="3.2" stroke-linecap="round"/><path d="M78 40c6 4 8 12 4 18M86 34c8 6 10 18 4 26" stroke="${R}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M26 92h68" stroke="${G}" stroke-width="3" stroke-linecap="round"/>`),
  makeup: wrap(`<rect x="50" y="56" width="20" height="38" rx="4" fill="none" stroke="${P}" stroke-width="3.2"/><rect x="53" y="40" width="14" height="18" rx="2" fill="${R}"/><path d="M53 40c2-8 12-8 14 0" fill="${R}"/><path d="M52 74h16" stroke="${G}" stroke-width="3" stroke-linecap="round"/><path d="M90 28l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="${G}"/>`),
  bridal: wrap(`<path d="M34 90V50c0-10 6-20 26-20s26 10 26 20v40" fill="none" stroke="${P}" stroke-width="3.2" stroke-linecap="round"/><path d="M44 90V54c0-8 4-14 16-14s16 6 16 14v36" fill="none" stroke="${R}" stroke-width="3" stroke-linecap="round" opacity=".8"/><circle cx="60" cy="24" r="5" fill="none" stroke="${G}" stroke-width="3"/><path d="M56 24l4 5 4-5" fill="none" stroke="${G}" stroke-width="3" stroke-linecap="round"/>`),
  brows: wrap(`<path d="M24 54c10-12 28-16 44-10" fill="none" stroke="${P}" stroke-width="5" stroke-linecap="round"/><path d="M56 70c10-8 24-8 38 0" fill="none" stroke="${R}" stroke-width="5" stroke-linecap="round"/><path d="M30 90l24-14" stroke="${G}" stroke-width="3.2" stroke-linecap="round"/><circle cx="28" cy="91" r="3.6" fill="${G}"/>`),
  lash: wrap(`<path d="M24 66c10 14 24 20 36 20s26-6 36-20" fill="none" stroke="${P}" stroke-width="3.4" stroke-linecap="round"/><path d="M28 62l-8-8M40 72l-4-12M52 76v-14M64 76v-14M76 74l5-12M88 68l8-8" stroke="${R}" stroke-width="3.4" stroke-linecap="round"/><circle cx="60" cy="40" r="7" fill="none" stroke="${G}" stroke-width="3"/>`),
  wax: wrap(`<path d="M44 32h32l-4 20H48Z" fill="none" stroke="${P}" stroke-width="3.2" stroke-linejoin="round"/><path d="M48 52l-2 38c0 4 4 6 14 6s14-2 14-6l-2-38" fill="none" stroke="${P}" stroke-width="3.2" stroke-linejoin="round"/><path d="M52 70c4-4 8 4 16 0" stroke="${G}" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M82 52l12-6M82 62l14 2" stroke="${R}" stroke-width="3" stroke-linecap="round"/>`),
};
export const serviceArt = (key) => ART[key] || ART.skin;
export const ritualArt = serviceArt;

/** Product silhouettes tinted per product. */
export function productArt(kind, tint = '#c27c6b') {
  const lid = '#efe6dc';
  const label = '<rect x="40" y="62" width="40" height="22" rx="3" fill="rgba(255,255,255,.9)"/><path d="M46 70h28M46 76h16" stroke="#3b1d2e" stroke-width="2" stroke-linecap="round"/>';
  const shapes = {
    jar: `<ellipse cx="60" cy="100" rx="32" ry="7" fill="rgba(59,29,46,.18)"/><rect x="28" y="54" width="64" height="44" rx="9" fill="${tint}"/><rect x="26" y="40" width="68" height="18" rx="7" fill="${lid}" stroke="rgba(59,29,46,.15)"/>${label}`,
    tin: `<ellipse cx="60" cy="96" rx="36" ry="7" fill="rgba(59,29,46,.18)"/><rect x="24" y="58" width="72" height="34" rx="7" fill="${tint}"/><ellipse cx="60" cy="58" rx="36" ry="9" fill="${lid}" stroke="rgba(59,29,46,.15)"/><ellipse cx="60" cy="58" rx="29" ry="6" fill="rgba(59,29,46,.12)"/><rect x="38" y="70" width="44" height="12" rx="2" fill="rgba(255,255,255,.9)"/>`,
    bottle: `<ellipse cx="60" cy="104" rx="26" ry="6" fill="rgba(59,29,46,.18)"/><rect x="51" y="14" width="18" height="16" rx="3" fill="#3b1d2e"/><rect x="47" y="28" width="26" height="10" rx="3" fill="${lid}" stroke="rgba(59,29,46,.15)"/><rect x="36" y="38" width="48" height="66" rx="13" fill="${tint}"/>${label}`,
    dropper: `<ellipse cx="60" cy="104" rx="24" ry="6" fill="rgba(59,29,46,.18)"/><path d="M52 10c0-4 16-4 16 0v22H52Z" fill="#3b1d2e"/><rect x="50" y="30" width="20" height="10" rx="2" fill="${lid}" stroke="rgba(59,29,46,.15)"/><rect x="38" y="40" width="44" height="64" rx="11" fill="${tint}" opacity=".95"/>${label}`,
    tube: `<ellipse cx="60" cy="104" rx="26" ry="6" fill="rgba(59,29,46,.18)"/><path d="M42 24h36l4 66c0 6-4 10-10 10H48c-6 0-10-4-10-10Z" fill="${tint}"/><rect x="44" y="12" width="32" height="14" rx="4" fill="${lid}" stroke="rgba(59,29,46,.15)"/><path d="M42 24h36" stroke="rgba(59,29,46,.2)" stroke-width="2"/>${label}`,
  };
  return `<svg class="art prod" viewBox="0 0 120 120" aria-hidden="true">${shapes[kind] || shapes.jar}</svg>`;
}

/** The hero: an arch with a blooming flower inside a ring of text. */
export function heroArt() {
  return `<svg class="hero-svg" viewBox="0 0 400 460" aria-hidden="true">
    <defs>
      <linearGradient id="archg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f3c9c4"/><stop offset="1" stop-color="#e7a3ae"/></linearGradient>
      <path id="ring" d="M200 230m-176 0a176 176 0 1 1 352 0a176 176 0 1 1-352 0"/>
    </defs>
    <circle cx="200" cy="230" r="198" fill="none" stroke="rgba(194,108,127,.32)" stroke-width="1.4"/>
    <text class="ring-text" fill="var(--rose)"><textPath href="#ring" startOffset="0">HAIR • NAILS • SKIN • HAMMAM • MAKE-UP • BRIDAL • WOMEN ONLY • CASABLANCA • </textPath></text>
    <path d="M120 360V210a80 80 0 0 1 160 0v150Z" fill="url(#archg)"/>
    <path d="M120 360V210a80 80 0 0 1 160 0v150" fill="none" stroke="var(--plum)" stroke-width="2.4"/>
    <g transform="translate(200 200)">
      <g class="petals" fill="#fff6f2" stroke="var(--plum)" stroke-width="2" stroke-linejoin="round">
        ${Array.from({ length: 8 }, (_, i) => `<path transform="rotate(${i * 45})" d="M0 -8c14-22 14-52 0-66-14 14-14 44 0 66Z"/>`).join('')}
      </g>
      <circle r="13" fill="var(--gold)" stroke="var(--plum)" stroke-width="2"/>
      <circle r="5" fill="var(--plum)" opacity=".5"/>
    </g>
    <path d="M200 276v84" stroke="var(--plum)" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M200 330c-30-2-52-18-60-42 30 0 52 14 60 42Z" fill="#9fbfae" stroke="var(--plum)" stroke-width="2" stroke-linejoin="round"/>
    <rect x="96" y="360" width="208" height="14" rx="7" fill="var(--plum)"/>
    <g fill="var(--gold)"><path d="M318 96l6 14 14 6-14 6-6 14-6-14-14-6 14-6Z"/><path d="M70 150l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z"/><path d="M332 296l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></g>
  </svg>`;
}

/** Five stars, filled up to `n`. */
export const stars = (n) => Array.from({ length: 5 }, (_, i) => `<svg class="star ${i + 1 <= Math.round(n) ? 'on' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9Z"/></svg>`).join('');
