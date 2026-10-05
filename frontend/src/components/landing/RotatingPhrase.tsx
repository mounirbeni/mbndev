'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * The italic second line of the hero headline ("Websites that …").
 * Cycles through short phrases; each word rises and fades in, staggered.
 * No CSS `filter` on the words: Safari/iOS renders gradient (background-clip)
 * text invisible while a filter is applied.
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

const HOLD_MS = 3400;
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
      {/* aria-label isn't allowed on a plain span; screen readers get this text instead */}
      <span className="sr-only">{PHRASES[i]}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={i} className="inline-block" aria-hidden>
          {words.map((w, k) => (
            <motion.span
              key={k}
              aria-hidden
              className="inline-block silk-text"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: '0.35em' }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.55, delay: k * 0.06, ease: EASE } }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: '-0.3em', transition: { duration: 0.22, delay: k * 0.02, ease: EASE } }}
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
