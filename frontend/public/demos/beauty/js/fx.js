// Soft motion for the LALLA site: falling petals, a sparkle trail, magnetic buttons, card tilt,
// pointer parallax and a scroll progress bar. Everything is decorative and switched off for
// visitors who prefer reduced motion; touch devices skip the pointer effects.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const PETALS = ['#f7bfd0', '#fbd6c4', '#e9d6f5', '#fbe6b8', '#f4a9c0', '#ffffff'];
const rand = (a, b) => a + Math.random() * (b - a);

export function petalField(el) {
  if (!el || reduce) return;
  el.innerHTML = Array.from({ length: 16 }, (_, i) => `<i style="--x:${rand(2, 98).toFixed(1)}%;--s:${rand(9, 20).toFixed(0)}px;--t:${rand(13, 24).toFixed(1)}s;--d:${(-rand(0, 20)).toFixed(1)}s;--sw:${rand(-90, 90).toFixed(0)}px;--c:${PETALS[i % PETALS.length]}"></i>`).join('');
}

/** A little burst of petals from the middle of `el` (booking confirmed, gift created…). */
export function burst(el) {
  if (!el || reduce) return;
  const wrap = document.createElement('span');
  wrap.className = 'burst'; wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + rand(-0.2, 0.2); const r = rand(70, 150);
    return `<i style="--c:${PETALS[i % PETALS.length]};--dx:${(Math.cos(a) * r).toFixed(0)}px;--dy:${(Math.sin(a) * r - 20).toFixed(0)}px;--rot:${rand(-260, 260).toFixed(0)}deg;--dl:${rand(0, 160).toFixed(0)}ms"></i>`;
  }).join('');
  el.append(wrap); setTimeout(() => wrap.remove(), 1700);
}

export function initFx() {
  // scroll progress
  const root = document.documentElement;
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--sp', max > 0 ? (scrollY / max).toFixed(4) : 0);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  if (reduce || !fine) return;

  // sparkle trail
  const layer = document.createElement('div'); layer.id = 'fxLayer'; layer.setAttribute('aria-hidden', 'true'); document.body.append(layer);
  let last = 0;
  addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (now - last < 60 || layer.childElementCount > 36) return;
    last = now;
    const i = document.createElement('i'); i.className = 'trail';
    i.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--c:${PETALS[Math.floor(rand(0, PETALS.length - 1))]};--dx:${rand(-28, 28).toFixed(0)}px;--dy:${rand(14, 48).toFixed(0)}px;--rot:${rand(-200, 200).toFixed(0)}deg`;
    layer.append(i); i.addEventListener('animationend', () => i.remove());
  }, { passive: true });

  // tilt cards, magnetic buttons, hero parallax (all delegated: cards are re-rendered often)
  let tilted = null; let magnet = null;
  const reset = (el) => { if (!el) return; el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); el.style.removeProperty('translate'); };
  addEventListener('pointermove', (e) => {
    const card = e.target.closest?.('.svc, .member, .pack, .plan, .prod');
    if (card !== tilted) { reset(tilted); tilted = card; }
    if (card) {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`); card.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
    }
    const mag = e.target.closest?.('.btn.glow, .tab-book');
    if (mag !== magnet) { reset(magnet); magnet = mag; }
    if (mag) {
      const r = mag.getBoundingClientRect();
      mag.style.translate = `${((e.clientX - (r.left + r.width / 2)) * 0.18).toFixed(1)}px ${((e.clientY - (r.top + r.height / 2)) * 0.28).toFixed(1)}px`;
    }
    const hero = document.getElementById('collage');
    if (hero && e.clientY < innerHeight) {
      hero.style.setProperty('--mx', ((e.clientX / innerWidth - 0.5) * 2).toFixed(3));
      hero.style.setProperty('--my', ((e.clientY / innerHeight - 0.5) * 2).toFixed(3));
    }
  }, { passive: true });
  document.addEventListener('pointerleave', () => { reset(tilted); reset(magnet); tilted = magnet = null; });
}
