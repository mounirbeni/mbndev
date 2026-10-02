'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * The italic second line of the hero headline ("Websites that …").
 * Cycles through short phrases; each word rises out of a soft blur, staggered.
 * The first phrase is what renders on the server (and for crawlers).
 */
const PHRASES = [
  'sell for you.',
  'win you clients.',
  'rank on Google.',
  'never sleep.',
  'build real trust.',
  'load in a blink.',
  'turn heads.',
  'book more guests.',
  'close the deal.',
  'look world-class.',
  'earn their keep.',
  'grow with you.',
];

const HOLD_MS = 3200;
const EASE = [0.16, 1, 0.3, 1] as const;

export default function RotatingPhrase({ className = '' }: { className?: string }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % PHRASES.length);
    }, HOLD_MS);
    return () => clearInterval(id);
  }, []);

  const words = PHRASES[i].split(' ');

  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={i} className="inline-block" aria-label={PHRASES[i]}>
          {words.map((w, k) => (
            <motion.span
              key={k}
              aria-hidden
              className="inline-block silk-text"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: '0.35em', filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, delay: k * 0.08, ease: EASE } }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: '-0.3em', filter: 'blur(8px)', transition: { duration: 0.35, delay: k * 0.04, ease: EASE } }}
            >
              {w}
              {k < words.length - 1 && ' '}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
