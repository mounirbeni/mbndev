'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Code2, Database, FileCheck2, FolderKanban, Globe, MessagesSquare, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';

const approach = [
  {
    icon: MessagesSquare,
    title: 'Understand the brief',
    description: 'Start with your goals, audience, requirements and the information needed for an accurate proposal.',
  },
  {
    icon: FileCheck2,
    title: 'Agree on the scope',
    description: 'Document deliverables, revisions, payment milestones, responsibilities and the delivery schedule.',
  },
  {
    icon: FolderKanban,
    title: 'Follow the work',
    description: 'Use your client workspace for project status, files and conversations.',
  },
  {
    icon: ShieldCheck,
    title: 'Prepare the handover',
    description: 'Agree on access, hosting, source files and optional maintenance before launch.',
  },
];

const technologies = ['Next.js 16', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'Prisma'];

const questions = [
  {
    question: 'What can MBN DEV build?',
    answer: 'Custom websites, e-commerce interfaces, web applications and SaaS-style dashboards. Specific features are determined in your project proposal.',
  },
  {
    question: 'Can I see progress during development?',
    answer: 'The client dashboard supports project status updates, messaging and shared project files. Your proposal determines the update and approval schedule.',
  },
  {
    question: 'How are prices and deadlines decided?',
    answer: 'Published packages are a starting point. We confirm your scope, quote and planned delivery dates before work starts.',
  },
  {
    question: 'What happens after launch?',
    answer: 'Handover and post-launch support depend on the package or separate maintenance agreement. We clarify those responsibilities in advance.',
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden px-4 sm:px-6 pt-36 pb-24">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-violet-600/[0.08] blur-[110px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="section-label mb-7 inline-flex">ABOUT MBN DEV</span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">Digital products with <span className="gradient-text">purpose.</span></h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">MBN DEV is a Moroccan web development platform operated by Mounir Banni. We create custom digital experiences and provide a structured workspace for project communication and delivery.</p>
        </motion.div>
      </section>

      <section className="px-4 sm:px-6 pb-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-stretch">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="premium-surface-featured relative rounded-3xl p-8 sm:p-11 overflow-hidden">
            <div className="absolute inset-0 premium-shimmer pointer-events-none" />
            <div className="relative z-10">
              <span className="text-violet-400 text-xs uppercase tracking-widest font-semibold">The founder</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-5">Mounir Banni</h2>
              <p className="text-slate-300 leading-relaxed mb-5">MBN DEV brings web development and the client experience into one place: from the initial brief to project discussions, revisions and final delivery.</p>
              <p className="text-slate-400 text-sm leading-relaxed">Every project is different. We define its scope and responsibilities before making commitments about features, pricing or timing.</p>
              <div className="inline-flex gap-2 items-center text-violet-300 text-xs font-semibold mt-8 border border-violet-500/20 rounded-full bg-violet-500/10 px-4 py-2"><Globe className="w-4 h-4" /> Based in Morocco · Remote collaboration</div>
            </div>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Sparkles, title: 'Designed for your brand', desc: 'Visual design tailored to your requirements.' },
              { icon: Code2, title: 'Custom development', desc: 'Websites and applications built for the agreed scope.' },
              { icon: Workflow, title: 'Clear process', desc: 'Documented project stages and revision rounds.' },
              { icon: Database, title: 'Client workspace', desc: 'Projects, communication and files in one place.' },
            ].map((item, index) => {
              const Icon = item.icon;
              return <motion.article key={item.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="premium-surface rounded-2xl p-6"><div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5"><Icon className="w-5 h-5 text-violet-400" /></div><h3 className="text-white font-bold mb-2">{item.title}</h3><p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p></motion.article>;
            })}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center"><span className="section-label">OUR PROCESS</span><h2 className="text-4xl sm:text-5xl font-black text-white mt-5">A clear path to <span className="gradient-text">delivery.</span></h2></div>
          <div className="grid md:grid-cols-2 gap-5">
            {approach.map((item, index) => {
              const Icon = item.icon;
              return <motion.article key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="premium-surface rounded-2xl p-7 flex items-start gap-5"><span className="w-11 h-11 rounded-xl shrink-0 bg-violet-500/10 border border-violet-500/20 flex justify-center items-center"><Icon className="w-5 h-5 text-violet-400" /></span><div><p className="text-violet-400 text-[10px] font-bold tracking-widest mb-2">STEP {String(index + 1).padStart(2, '0')}</p><h3 className="text-white text-lg font-bold mb-2">{item.title}</h3><p className="text-slate-400 text-sm leading-relaxed">{item.description}</p></div></motion.article>;
            })}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-28">
        <div className="max-w-6xl mx-auto premium-surface rounded-3xl p-8 sm:p-12">
          <span className="section-label">TECHNOLOGY</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4">Tools used in our platform.</h2>
          <p className="text-slate-400 max-w-xl mb-8">Our project uses the following technologies. Your project stack is selected according to its actual requirements.</p>
          <div className="flex flex-wrap gap-3">{technologies.map((tech) => <span key={tech} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm">{tech}</span>)}</div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-white text-center mb-10">Frequently asked <span className="gradient-text">questions.</span></h2>
          <div className="space-y-3">{questions.map((item) => <details key={item.question} className="premium-surface rounded-2xl p-6 group"><summary className="text-white font-semibold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">{item.question}</summary><p className="text-slate-400 text-sm leading-relaxed pt-4">{item.answer}</p></details>)}</div>
          <div className="premium-surface-featured rounded-3xl p-8 sm:p-10 text-center mt-14">
            <h2 className="text-white text-2xl sm:text-3xl font-black mb-4">Have a project in mind?</h2>
            <p className="text-slate-400 mb-7">Tell us what you need and we will discuss an appropriate scope and quote.</p>
            <Link href="/request" className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl px-6 py-3.5 transition-colors">Start your project <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
