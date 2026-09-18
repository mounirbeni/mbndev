'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ClipboardList, FolderKanban, MessagesSquare, ListChecks, FileCheck2, ShieldCheck } from 'lucide-react';

// Do not invent client names, conversion improvements, star ratings, or
// unconditional contractual guarantees. Verified testimonials can be added
// through an approved content process with the client's permission.
const benefits = [
  {
    icon: ClipboardList,
    title: 'A clear proposal',
    description: 'Agree on project scope, deliverables, pricing and a timeline before development starts.',
    color: '#a78bfa',
  },
  {
    icon: FolderKanban,
    title: 'Your own workspace',
    description: 'Keep your project information, files and status updates in one client dashboard.',
    color: '#60a5fa',
  },
  {
    icon: MessagesSquare,
    title: 'Project conversations',
    description: 'Discuss requirements and follow-up questions directly in your project thread.',
    color: '#f59e0b',
  },
  {
    icon: ListChecks,
    title: 'Visible milestones',
    description: 'Follow progress and review the stages recorded for your project.',
    color: '#34d399',
  },
  {
    icon: FileCheck2,
    title: 'Defined revisions',
    description: 'Revision rounds and any out-of-scope requests are clarified in the proposal.',
    color: '#f472b6',
  },
  {
    icon: ShieldCheck,
    title: 'Clear handover',
    description: 'Agree on access, source files, hosting responsibilities and optional support before launch.',
    color: '#22d3ee',
  },
];

export default function Testimonials() {
  return (
    <section id="commitments" className="py-24 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 ambient-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[140px] bg-violet-600/5 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mb-12 sm:mb-16">
          <span className="section-label mb-6">THE CLIENT EXPERIENCE</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Clarity from <span className="gradient-text">first brief to handover.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mt-5">
            A structured development process, with the details and responsibilities recorded in your project proposal.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.article key={benefit.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.05 }} className="premium-surface rounded-2xl p-6 sm:p-7 min-h-[190px]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ color: benefit.color, background: `${benefit.color}18`, border: `1px solid ${benefit.color}35` }}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
              </motion.article>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <Link href="/request" className="inline-flex items-center justify-center gap-2 text-violet-400 hover:text-violet-300 font-semibold text-sm">
            Discuss your project <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
