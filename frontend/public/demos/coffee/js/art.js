// Vector "anatomy" art: every drink is drawn from its recipe (layers bottom → top), so the
// customiser can redraw it live — more milk, an extra shot, oat instead of whole, iced…
import { INK } from './data.js';

let uid = 0;

// Glassware outlines in a 120 × 160 box: top width, bottom width, top y, bottom y, handle, fill level.
const GLASS = {
  demi: { tw: 46, bw: 38, ty: 92, by: 146, handle: false, fill: 0.62 },
  gibraltar: { tw: 58, bw: 52, ty: 74, by: 146, handle: false, fill: 0.86 },
  cup: { tw: 70, bw: 50, ty: 62, by: 146, handle: true, fill: 0.9 },
  glass: { tw: 64, bw: 54, ty: 32, by: 146, handle: false, fill: 0.9 },
  tall: { tw: 58, bw: 48, ty: 16, by: 148, handle: false, fill: 0.88 },
  mug: { tw: 62, bw: 58, ty: 44, by: 146, handle: true, fill: 0.86 },
  carafe: { tw: 40, bw: 76, ty: 40, by: 146, handle: false, fill: 0.55, carafe: true },
  teaglass: { tw: 52, bw: 38, ty: 50, by: 146, handle: false, fill: 0.84, tea: true },
};

/** Recipe → actual layers for the chosen options. */
export function recipe(item, sel = {}) {
  let layers = item.layers.map(([k, f]) => [k, f]);
  const milk = sel.milk && sel.milk !== 'milk' ? sel.milk : null;
  if (milk) layers = layers.map(([k, f]) => [k === 'milk' ? milk : k, f]);
  if (sel.shots === '3') layers = layers.map(([k, f]) => [k, k === 'espresso' ? f * 1.45 : f]);
  if (sel.syrup && sel.syrup !== 'none') layers = [['syrup', 0.07], ...layers];
  const total = layers.reduce((n, [, f]) => n + f, 0);
  layers = layers.map(([k, f]) => [k, f / total]);
  const iced = item.iced || sel.temp === 'iced';
  if (iced) {
    layers = layers.filter(([k]) => k !== 'foam' && k !== 'crema');
    const t2 = layers.reduce((n, [, f]) => n + f, 0);
    layers = layers.map(([k, f]) => [k, f / t2]);
  }
  return { layers, iced, scale: sel.sizeScale || 1 };
}

export function drinkSVG(item, sel = {}, { steam = true, cls = '' } = {}) {
  const g = GLASS[item.cup] || GLASS.glass;
  const { layers, iced, scale } = recipe(item, sel);
  const id = `g${++uid}`;
  const cx = 60;
  const x = (w, y) => { // left/right edges of the glass at height y
    const t = (y - g.ty) / (g.by - g.ty);
    const hw = (g.tw + (g.bw - g.tw) * t) / 2;
    return [cx - hw, cx + hw];
  };
  const [tl, tr] = x(0, g.ty); const [bl, br] = x(0, g.by);
  const r = 8;
  const outline = g.carafe
    ? `M${cx - 14} ${g.ty} L${cx - 14} ${g.ty + 18} Q${bl - 6} ${g.ty + 40} ${bl} ${g.by - r} Q${bl} ${g.by} ${bl + r} ${g.by} L${br - r} ${g.by} Q${br} ${g.by} ${br} ${g.by - r} Q${br + 6} ${g.ty + 40} ${cx + 14} ${g.ty + 18} L${cx + 14} ${g.ty} Z`
    : `M${tl} ${g.ty} L${bl} ${g.by - r} Q${bl} ${g.by} ${bl + r} ${g.by} L${br - r} ${g.by} Q${br} ${g.by} ${br} ${g.by - r} L${tr} ${g.ty} Z`;
  const fillTop = g.by - (g.by - g.ty) * g.fill;
  let y = g.by;
  const H = g.by - fillTop;
  const bands = layers.map(([k, f]) => {
    const h = H * f; y -= h;
    return `<rect x="0" y="${(y - 0.6).toFixed(2)}" width="120" height="${(h + 1.2).toFixed(2)}" fill="${INK[k] || k}"/>`;
  }).join('');
  // soft blends between layers (latte gradient look)
  const ice = iced ? [0, 1, 2, 3].map((i) => {
    const iy = fillTop + 6 + i * 15 + (i % 2) * 4; const ix = cx - 16 + ((i * 13) % 26);
    return `<rect x="${ix}" y="${iy}" width="17" height="15" rx="3" fill="${INK.ice}" stroke="rgba(255,255,255,0.8)" stroke-width="1" transform="rotate(${(i * 23) % 40 - 18} ${ix + 8} ${iy + 7})"/>`;
  }).join('') : '';
  const bubbles = item.id === 'tonic' ? [0, 1, 2, 3, 4, 5].map((i) => `<circle class="bub" style="--d:${i * 0.4}s" cx="${cx - 14 + i * 6}" cy="${g.by - 10 - (i % 3) * 18}" r="${1.4 + (i % 2)}" fill="rgba(255,255,255,0.9)"/>`).join('') : '';
  const mint = g.tea ? `<path d="M${cx - 8} ${fillTop + 2} q8 -14 16 -2 q-8 6 -16 2z" fill="#3f8a4a"/><path d="M${cx - 2} ${fillTop - 6} q10 -8 14 4 q-8 2 -14 -4z" fill="#56a35c"/>` : '';
  const teaGold = g.tea ? `<path d="M${bl + 2} ${g.by - 30} L${br - 2} ${g.by - 30}" stroke="#d4a73a" stroke-width="3" stroke-dasharray="3 3"/><path d="M${tl + 3} ${g.ty + 14} L${tr - 3} ${g.ty + 14}" stroke="#d4a73a" stroke-width="2"/>` : '';
  const handle = g.handle ? `<path d="M${br + (tr - br) * 0.25} ${g.ty + 22} q24 4 18 34 q-4 18 -22 18" fill="none" stroke="var(--glass-stroke, #1d1712)" stroke-width="3.2" stroke-linecap="round" opacity="0.85"/>` : '';
  const hot = !iced && steam && item.kind === 'drink' && !g.tea ? `<g class="steam" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity="0.35">
      <path d="M${cx - 10} ${g.ty - 6} q-6 -10 0 -18 q6 -8 0 -18"/><path d="M${cx + 6} ${g.ty - 4} q-6 -10 0 -18 q6 -8 0 -18" style="animation-delay:.8s"/></g>` : '';
  const drops = iced ? `<g fill="rgba(255,255,255,0.75)"><circle cx="${bl + 8}" cy="${g.by - 30}" r="1.6"/><circle cx="${br - 10}" cy="${g.by - 52}" r="1.3"/><circle cx="${bl + 14}" cy="${g.by - 70}" r="1.1"/></g>` : '';
  const k = scale;
  return `<svg class="art ${cls}" viewBox="0 0 120 160" aria-hidden="true">
    <defs><clipPath id="${id}"><path d="${outline}"/></clipPath>
      <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient></defs>
    <g transform="translate(60 150) scale(${k}) translate(-60 -150)">
      ${hot}
      <ellipse cx="60" cy="${g.by + 3}" rx="${(g.bw / 2) + 6}" ry="4" fill="#000" opacity=".12"/>
      ${handle}
      <g clip-path="url(#${id})"><rect x="0" y="0" width="120" height="160" fill="rgba(255,255,255,0.35)"/>${bands}${ice}${bubbles}${mint}
        <rect x="0" y="0" width="120" height="160" fill="url(#${id}s)"/></g>
      ${teaGold}
      <path d="${outline}" fill="none" stroke="var(--glass-stroke, #1d1712)" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M${tl + 6} ${g.ty + 10} L${bl + 6} ${g.by - 16}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      ${drops}
    </g></svg>`;
}

const PLATE = '<ellipse cx="60" cy="122" rx="52" ry="16" fill="#efe8de" stroke="var(--glass-stroke,#1d1712)" stroke-width="2.4"/><ellipse cx="60" cy="120" rx="36" ry="9" fill="none" stroke="#d9cfc1" stroke-width="1.5"/>';
const GOLD = '#e3a457', GOLD2 = '#c9823a', DARK = '#4a2a17';

export function foodSVG(art) {
  const S = 'stroke="var(--glass-stroke,#1d1712)" stroke-width="2.4" stroke-linejoin="round"';
  const parts = {
    croissant: `${PLATE}<g ${S}><path d="M14 108 Q16 92 30 88 Q40 74 60 74 Q80 74 90 88 Q104 92 106 108 Q96 100 86 102 Q76 94 60 94 Q44 94 34 102 Q24 100 14 108Z" fill="${GOLD}"/>
      <path d="M30 88 Q36 96 34 102 M46 77 Q52 88 48 95 M60 74 L60 94 M74 77 Q68 88 72 95 M90 88 Q84 96 86 102" fill="none" stroke-width="1.8"/></g>
      <path d="M40 82 Q60 76 80 82" stroke="#fff" stroke-width="2.4" opacity=".4" fill="none" stroke-linecap="round"/>`,
    painchoc: `${PLATE}<g ${S}><rect x="28" y="86" width="64" height="30" rx="10" fill="${GOLD}"/><path d="M44 86 v30 M60 86 v30 M76 86 v30" fill="none" opacity=".5"/></g>
      <rect x="26" y="96" width="8" height="10" rx="2" fill="${DARK}"/><rect x="86" y="96" width="8" height="10" rx="2" fill="${DARK}"/>`,
    msemen: `${PLATE}<g ${S}><path d="M32 112 L40 82 L84 78 L90 108 Z" fill="${GOLD}"/><path d="M38 96 L86 92" fill="none" opacity=".45"/></g>
      <path d="M46 84 q6 10 0 18 q8 4 14 -2 q6 8 14 2" stroke="#f0b93a" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    loaf: `${PLATE}<g ${S}><path d="M34 116 L34 86 Q34 72 60 72 Q86 72 86 86 L86 116 Z" fill="#9a6a3e"/><path d="M40 112 L40 88 Q40 80 60 80 Q80 80 80 88 L80 112 Z" fill="#c99a62" stroke-width="1.6"/></g>
      <g fill="${DARK}"><circle cx="52" cy="94" r="2.4"/><circle cx="66" cy="100" r="2"/><circle cx="58" cy="106" r="2.2"/></g>`,
    bun: `${PLATE}<g ${S}><circle cx="60" cy="98" r="24" fill="${GOLD}"/><path d="M60 98 m-14 0 a14 14 0 1 1 14 14 a9 9 0 1 1 -6 -16" fill="none"/></g>
      <g fill="#fff" opacity=".8"><circle cx="50" cy="86" r="1.4"/><circle cx="68" cy="90" r="1.2"/><circle cx="62" cy="108" r="1.4"/><circle cx="72" cy="102" r="1.1"/></g>`,
    toast: `${PLATE}<g ${S}><path d="M30 114 L30 84 Q30 70 46 72 Q52 64 62 70 Q76 64 84 76 Q92 82 90 92 L90 114 Z" fill="#d7a466"/>
      <path d="M38 108 L38 88 Q38 80 48 82 Q60 74 72 82 Q84 82 82 94 L82 108 Z" fill="#8cb84f" stroke-width="1.8"/></g>
      <g fill="#c0392b"><circle cx="50" cy="94" r="2"/><circle cx="64" cy="90" r="2"/><circle cx="72" cy="100" r="2"/></g>`,
    pan: `<g ${S}><path d="M98 104 L118 96" stroke-width="6" stroke-linecap="round"/><ellipse cx="58" cy="108" rx="46" ry="20" fill="#2b2522"/><ellipse cx="58" cy="104" rx="38" ry="14" fill="#c4442a" stroke-width="1.6"/></g>
      <ellipse cx="44" cy="102" rx="10" ry="6" fill="#fffaf0"/><circle cx="44" cy="102" r="4" fill="#f4b223"/><ellipse cx="70" cy="106" rx="10" ry="6" fill="#fffaf0"/><circle cx="70" cy="106" r="4" fill="#f4b223"/>
      <g fill="#4f8a3c"><circle cx="58" cy="96" r="2"/><circle cx="82" cy="100" r="1.6"/><circle cx="32" cy="108" r="1.6"/></g>`,
    bowl: `<g ${S}><path d="M18 88 Q22 132 60 132 Q98 132 102 88 Z" fill="#f1ece4"/><ellipse cx="60" cy="88" rx="42" ry="10" fill="#fff8ee"/></g>
      <g><circle cx="44" cy="86" r="5" fill="#c0392b"/><circle cx="56" cy="84" r="4" fill="#6c3483"/><circle cx="70" cy="86" r="5" fill="#f39c12"/><circle cx="80" cy="88" r="3.5" fill="#c0392b"/></g>
      <g fill="#b7864a"><circle cx="36" cy="90" r="2"/><circle cx="50" cy="91" r="2"/><circle cx="64" cy="91" r="2"/><circle cx="86" cy="91" r="2"/></g>`,
    plate: `${PLATE}<g ${S}><rect x="26" y="96" width="34" height="22" rx="6" fill="#d7a466"/></g>
      <path d="M62 98 q10 -12 22 -4 q14 6 6 18 q-10 10 -24 4 q-10 -8 -4 -18z" fill="#fff6dd" stroke="var(--glass-stroke,#1d1712)" stroke-width="2"/><circle cx="74" cy="104" r="6" fill="#f4b223"/>`,
  };
  return `<svg class="art food" viewBox="2 48 116 96" aria-hidden="true">${parts[art] || parts.plate}</svg>`;
}

export const artFor = (item, sel) => (item.kind === 'drink' ? drinkSVG(item, sel) : foodSVG(item.art));

/** Coffee bag for the beans shop, coloured per origin. */
export function bagSVG(color, label) {
  return `<svg class="art bag" viewBox="0 0 120 160" aria-hidden="true">
    <ellipse cx="60" cy="150" rx="40" ry="5" fill="#000" opacity=".12"/>
    <path d="M28 26 L92 26 L98 146 L22 146 Z" fill="${color}" stroke="var(--glass-stroke,#1d1712)" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M28 26 L36 14 L84 14 L92 26" fill="${color}" stroke="var(--glass-stroke,#1d1712)" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M30 40 L90 40" stroke="var(--glass-stroke,#1d1712)" stroke-width="1.6" stroke-dasharray="3 4"/>
    <rect x="34" y="64" width="52" height="50" rx="4" fill="#fbf6ee" stroke="var(--glass-stroke,#1d1712)" stroke-width="2"/>
    <text x="60" y="86" text-anchor="middle" font-family="Fraunces, serif" font-weight="700" font-size="15" fill="#1d1712">NOUR</text>
    <text x="60" y="102" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="7" fill="#1d1712">${label}</text>
    <circle cx="60" cy="128" r="6" fill="none" stroke="#fbf6ee" stroke-width="2" opacity=".7"/>
  </svg>`;
}
