'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/**
 * A number that counts up smoothly the first time it scrolls into view, and
 * glides to the new value whenever `value` changes afterwards (live data).
 * Frames are written straight to the DOM — no React re-render per frame.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

const fmt = (v: number, format: 'number' | 'currency', decimals: number) =>
  format === 'currency'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v)
    : new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);

interface CountUpProps {
  value: number;
  format?: 'number' | 'currency';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Seconds for the first count from zero. */
  duration?: number;
  className?: string;
}

export default function CountUp({
  value,
  format = 'number',
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.6,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const shown = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    const write = (v: number) => {
      shown.current = v;
      el.textContent = prefix + fmt(v, format, decimals) + suffix;
    };
    if (reduced) { write(value); return; }
    const first = !started.current;
    started.current = true;
    const controls = animate(shown.current, value, {
      duration: first ? duration : 0.9,
      ease: EASE,
      onUpdate: (v) => write(decimals ? v : Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, format, decimals, prefix, suffix, duration, reduced]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`} aria-label={prefix + fmt(value, format, decimals) + suffix}>
      {prefix + fmt(0, format, decimals) + suffix}
    </span>
  );
}

/** Counts up a stat written as text, e.g. "40+", "98%", "$1,200": the number animates, the rest stays. */
export function CountUpText({ text, className }: { text: string; className?: string }) {
  const m = text.match(/^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!m) return <span className={className}>{text}</span>;
  const [, prefix, num, suffix] = m;
  const decimals = num.includes('.') ? num.split('.')[1].length : 0;
  return <CountUp value={Number(num.replace(/,/g, ''))} prefix={prefix} suffix={suffix} decimals={decimals} className={className} />;
}
