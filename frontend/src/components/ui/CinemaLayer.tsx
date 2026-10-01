'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Cinema finish for the public site:
 *  - a fixed film-grain layer over everything (pointer-events: none);
 *  - on precise pointers, a soft ring that trails the cursor and opens up
 *    with a label over anything marked `data-cursor="Label"`.
 * Both are skipped under prefers-reduced-motion. The native cursor stays.
 */
export default function CinemaLayer() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    // The ring is hidden by CSS on touch screens and under reduced motion;
    // there it never gets a position either.
    if (!window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;

    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      ringRef.current?.setAttribute('data-live', 'true');
      const el = (e.target as HTMLElement | null)?.closest?.('[data-cursor]') as HTMLElement | null;
      setLabel(el ? el.dataset.cursor || '' : null);
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div aria-hidden className="cinema-grain" />
      <div ref={ringRef} aria-hidden className="cinema-cursor" data-open={label !== null}>
        <span>{label}</span>
      </div>
    </>
  );
}
