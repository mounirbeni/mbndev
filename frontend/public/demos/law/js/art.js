// Small SVG helpers for the law-firm site: star ratings and the hero illustration used until photos exist.
export const stars = (n) => `<span class="stars" role="img" aria-label="${n.toFixed(1)} / 5">${Array.from({ length: 5 }, (_, i) => `<svg class="star ${i < Math.round(n) ? 'on' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1Z"/></svg>`).join('')}</span>`;

/** A calm line illustration of a pediment, columns and scales. */
export const heroArt = () => `<svg class="hero-svg" viewBox="0 0 420 480" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
  <rect x="30" y="30" width="360" height="420" rx="6" class="plate" stroke="none"/>
  <g class="lines" stroke-width="2">
    <path d="M70 170 210 92l140 78Z"/><path d="M92 170h236"/>
    <path d="M110 186v150M160 186v150M210 186v150M260 186v150M310 186v150"/>
    <path d="M86 336h248M70 358h280M54 380h312"/>
    <circle cx="210" cy="142" r="14" class="gold-line"/>
  </g>
  <g class="scales" stroke-width="2.4">
    <path d="M210 250v70"/><path d="M178 320h64"/><path d="M158 250h104"/>
    <path d="m158 250-18 40h36Z"/><path d="m262 250-18 40h36Z"/>
    <path d="M140 290c0 9 8 14 18 14s18-5 18-14M244 290c0 9 8 14 18 14s18-5 18-14"/>
  </g>
</svg>`;
