// Soft decorative shapes shared by the LALLA site: a scalloped "flower" outline and an organic blob.
// Photos are masked with these (clip paths) instead of hard-edged frames.
const flowerPath = (n = 10, a = 0.045, r0 = 0.43, steps = 240) => {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (2 * Math.PI * i) / steps; const r = r0 + a * Math.cos(n * t);
    pts.push(`${(0.5 + r * Math.cos(t)).toFixed(4)} ${(0.5 + r * Math.sin(t)).toFixed(4)}`);
  }
  return `M${pts.join(' L')}Z`;
};
export const FLOWER_D = flowerPath();
// a soft, slightly lopsided blob (unit box)
export const BLOB_D = 'M0.47 0.01C0.76-0.01 0.98 0.17 0.98 0.45C0.98 0.75 0.81 0.99 0.51 0.99C0.2 0.99 0.02 0.79 0.02 0.52C0.02 0.2 0.2 0.03 0.47 0.01Z';
export const BLOB2_D = 'M0.52 0.02C0.8 0.03 0.99 0.24 0.97 0.52C0.95 0.8 0.76 0.98 0.49 0.98C0.2 0.98 0.01 0.76 0.03 0.48C0.05 0.2 0.25 0.01 0.52 0.02Z';

export const flowerSvg = (cls = '') => `<svg class="flower ${cls}" viewBox="0 0 1 1" aria-hidden="true"><path d="${FLOWER_D}"/></svg>`;

/** Registers the clip paths once (url(#cpBlob), url(#cpBlob2), url(#cpFlower)). */
export function mountDefs() {
  if (document.getElementById('lallaDefs')) return;
  const d = document.createElement('div');
  d.id = 'lallaDefs'; d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = `<svg width="0" height="0"><defs>
    <clipPath id="cpBlob" clipPathUnits="objectBoundingBox"><path d="${BLOB_D}"/></clipPath>
    <clipPath id="cpBlob2" clipPathUnits="objectBoundingBox"><path d="${BLOB2_D}"/></clipPath>
    <clipPath id="cpFlower" clipPathUnits="objectBoundingBox"><path d="${FLOWER_D}"/></clipPath></defs></svg>`;
  document.body.prepend(d);
}
