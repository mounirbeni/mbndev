'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, Repeat, Clock, MessageSquare, Code2, Sparkles,
  ArrowRight,
} from 'lucide-react';

// Replaced fabricated testimonials with concrete commitments we can stand
// behind — every line below is something the platform actually delivers
// (visible to clients in their dashboard) or that we contractually honour.
//
// When real reviewable client work exists, this section can be swapped
// for a CMS-backed list. Until then, "honest specifics" beat "fake quotes."

const commitments = [
  {
    icon: ShieldCheck,
    title: 'No surprise pricing',
    desc:  'Quote in writing before any work starts. The number you see on /pricing is the number you pay.',
  },
  {
    icon: Repeat,
    title: 'Revisions included',
    desc:  'Every package comes with structured revision rounds. Tracked transparently in your dashboard.',
  },
  {
    icon: Clock,
    title: 'Real delivery dates',
    desc:  'Each project has a stated delivery window. If we slip, the next package up is on us.',
  },
  {
    icon: MessageSquare,
    title: 'Direct communication',
    desc:  'Project messages, not ticket queues. You talk to the person building your project.',
  },
  {
    icon: Code2,
    title: 'You own the code',
    desc:  'Source delivered on completion. No vendor lock-in, no recurring license fees.',
  },
  {
    icon: Sparkles,
    title: 'Built on modern tooling',
    desc:  'Next.js, TypeScript, Tailwind, PostgreSQL. The same stack we use for this platform.',
  },
];

export default function Testimonials() {
  return (
    <section id="commitments" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-3 block">
            Why MBN DEV
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            What we <span className="gradient-text">commit to</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Concrete promises, not testimonials. Everything below is honoured for every project — no exceptions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {commitments.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-6 border border-white/5 hover:border-primary-500/25 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary-300" />
                </div>
                <h3 className="text-white font-semibold text-base mb-1.5">{c.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/request"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            Start a project on these terms
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
