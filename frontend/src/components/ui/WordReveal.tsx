'use client';

import { useRef } from 'react';
import { m as motion, useInView } from 'framer-motion';

interface WordRevealProps {
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  /** Set the last N words in the italic serif accent. */
  accentLast?: number;
}

export default function WordReveal({ text, className = '', delay = 0, as: Tag = 'h2', accentLast = 0 }: WordRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const words = text.split(' ');

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className} style={{ overflow: 'hidden' }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.28em' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            className={i >= words.length - accentLast ? 'serif-accent silk-text pr-[0.06em]' : undefined}
            initial={{ y: '110%', opacity: 0 }}
            animate={inView ? { y: '0%', opacity: 1 } : {}}
            transition={{
              duration: 0.65,
              delay: delay + i * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
