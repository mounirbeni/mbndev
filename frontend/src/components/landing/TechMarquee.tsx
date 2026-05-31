'use client';

import { motion } from 'framer-motion';

const TECH_ROW_1 = [
  'Next.js', 'React', 'TypeScript', 'Node.js', 'Tailwind CSS',
  'PostgreSQL', 'Prisma', 'Vercel', 'Framer Motion', 'Stripe',
];

const TECH_ROW_2 = [
  'Express', 'REST APIs', 'SSE Realtime', 'JWT Auth', 'Responsive Design',
  'SEO Optimized', 'PWA Ready', 'CI/CD', 'Git', 'Figma',
];

function MarqueeRow({ items, reverse = false, speed = 30 }: { items: string[]; reverse?: boolean; speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
      <motion.div
        className="flex gap-4 w-max"
        animate={{ x: reverse ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((tech, i) => (
          <span
            key={`${tech}-${i}`}
            className="shrink-0 px-5 py-2.5 rounded-full text-[12px] font-semibold tracking-wide whitespace-nowrap"
            style={{
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.12)',
              color: 'rgba(168,85,247,0.7)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.background = 'rgba(124,58,237,0.14)';
              el.style.borderColor = 'rgba(124,58,237,0.35)';
              el.style.color = 'rgba(196,181,253,0.95)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.background = 'rgba(124,58,237,0.06)';
              el.style.borderColor = 'rgba(124,58,237,0.12)';
              el.style.color = 'rgba(168,85,247,0.7)';
            }}
          >
            {tech}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function TechMarquee() {
  return (
    <section className="relative py-14 overflow-hidden" style={{ background: 'rgba(7,6,15,0.95)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15) 30%, rgba(168,85,247,0.2) 50%, rgba(59,130,246,0.15) 70%, transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 50%, transparent)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-600"
        >
          Built with modern technologies
        </motion.p>
      </div>

      <div className="space-y-4">
        <MarqueeRow items={TECH_ROW_1} speed={35} />
        <MarqueeRow items={TECH_ROW_2} reverse speed={40} />
      </div>
    </section>
  );
}
