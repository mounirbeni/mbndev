'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ITEMS = [
  'WEB DEVELOPMENT', 'UI / UX DESIGN', 'SAAS PLATFORMS', 'E-COMMERCE',
  'DIGITAL PRODUCTS', 'BRAND IDENTITY', 'NEXT.JS', 'PERFORMANCE',
];

export default function ScrollingBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // Left row moves right-to-left, right row moves left-to-right as user scrolls
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-25%', '0%']);

  const row = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div ref={ref} className="relative overflow-hidden py-6 select-none pointer-events-none" style={{
      borderTop:    '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background:   'rgba(7,6,15,0.6)',
    }}>
      {/* Row 1 — scrolls left */}
      <motion.div style={{ x: x1 }} className="flex gap-8 mb-3 whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 text-[11px] font-bold tracking-[0.25em] text-slate-600">
            {item}
            <span className="w-1 h-1 rounded-full bg-violet-700/60 shrink-0" />
          </span>
        ))}
      </motion.div>

      {/* Row 2 — scrolls right */}
      <motion.div style={{ x: x2 }} className="flex gap-8 whitespace-nowrap">
        {[...row].reverse().map((item, i) => (
          <span key={i} className="flex items-center gap-8 text-[11px] font-bold tracking-[0.25em] text-violet-900/50">
            {item}
            <span className="w-1 h-1 rounded-full bg-slate-700/60 shrink-0" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
