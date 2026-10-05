'use client';

/**
 * Lenis smooth scroll + GSAP ScrollTrigger integration.
 * Drop this once inside the root layout — it self-manages the raf loop.
 *
 * Lenis only smooths wheel scrolling, so touch-first devices keep native
 * scrolling and never download it; elsewhere it's loaded after mount, off
 * the critical path.
 */

import { useEffect } from 'react';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Respect users who opt out of motion — fall back to native scrolling
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
          duration:  1.2,
          easing:    (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        // Sync Lenis scroll position with ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // Drive Lenis from GSAP's ticker so everything stays in sync
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        cleanup = () => {
          lenis.destroy();
          gsap.ticker.remove(tick);
        };
      },
    );

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <>{children}</>;
}
