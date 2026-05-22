'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Zap, Code2, Database, Globe, Server, Layers,
  GitBranch, Terminal, Star, Users, FolderOpen, Clock,
  MapPin, Wifi, Sparkles, Shield, Rocket, Handshake,
  MessageSquare, DollarSign, UserCheck, Timer, ChevronDown,
  Check,
} from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
};

export default function AboutPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const skills = [
    { name: 'React / Next.js', level: 98 },
    { name: 'Node.js / Express', level: 95 },
    { name: 'TypeScript', level: 92 },
    { name: 'PostgreSQL / Prisma', level: 88 },
    { name: 'MongoDB', level: 85 },
    { name: 'UI/UX Design', level: 82 },
  ];

  const technologies = [
    { icon: Code2, label: 'Next.js 14' },
    { icon: Layers, label: 'React' },
    { icon: Terminal, label: 'Node.js' },
    { icon: Database, label: 'PostgreSQL' },
    { icon: Server, label: 'Express.js' },
    { icon: GitBranch, label: 'Prisma ORM' },
    { icon: Globe, label: 'Tailwind CSS' },
    { icon: Zap, label: 'TypeScript' },
  ];

  const stats = [
    { icon: Clock, value: '5+', label: t('about.stats.experience') },
    { icon: FolderOpen, value: '40+', label: t('about.stats.projects') },
    { icon: Users, value: '30+', label: t('about.stats.clients') },
    { icon: Star, value: '100%', label: t('about.stats.satisfaction') },
  ];

  const values = [
    { icon: Sparkles, title: t('about.values.craft.title'), desc: t('about.values.craft.desc') },
    { icon: Shield, title: t('about.values.transparent.title'), desc: t('about.values.transparent.desc') },
    { icon: Rocket, title: t('about.values.speed.title'), desc: t('about.values.speed.desc') },
    { icon: Handshake, title: t('about.values.partner.title'), desc: t('about.values.partner.desc') },
  ];

  const soloPoints = [
    { icon: MessageSquare, title: t('about.solo.p1.title'), desc: t('about.solo.p1.desc') },
    { icon: DollarSign, title: t('about.solo.p2.title'), desc: t('about.solo.p2.desc') },
    { icon: UserCheck, title: t('about.solo.p3.title'), desc: t('about.solo.p3.desc') },
    { icon: Timer, title: t('about.solo.p4.title'), desc: t('about.solo.p4.desc') },
  ];

  const timeline = [
    { year: '2019', title: t('about.timeline.2019.title'), desc: t('about.timeline.2019.desc') },
    { year: '2020', title: t('about.timeline.2020.title'), desc: t('about.timeline.2020.desc') },
    { year: '2021', title: t('about.timeline.2021.title'), desc: t('about.timeline.2021.desc') },
    { year: '2022', title: t('about.timeline.2022.title'), desc: t('about.timeline.2022.desc') },
    { year: '2023', title: t('about.timeline.2023.title'), desc: t('about.timeline.2023.desc') },
    { year: '2024', title: t('about.timeline.2024.title'), desc: t('about.timeline.2024.desc') },
  ];

  const faqs = [
    { q: t('about.faq.q1'), a: t('about.faq.a1') },
    { q: t('about.faq.q2'), a: t('about.faq.a2') },
    { q: t('about.faq.q3'), a: t('about.faq.a3') },
    { q: t('about.faq.q4'), a: t('about.faq.a4') },
    { q: t('about.faq.q5'), a: t('about.faq.a5') },
  ];

  return (
    <PublicLayout>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="pt-36 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="section-label mb-8 inline-flex">{t('about.badge')}</span>
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
              {t('about.hero.title')}{' '}
              <span className="gradient-text">{t('about.hero.name')}</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t('about.hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  {...fadeUp}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="premium-surface rounded-2xl p-6 text-center"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <Icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="text-4xl font-black text-white mb-1 tracking-tight">{s.value}</div>
                  <div className="text-slate-500 text-sm">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MY STORY ─────────────────────────────────────────────────── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left: text */}
            <motion.div {...fadeUp}>
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-violet-400 mb-3 block">
                {t('about.story.eyebrow')}
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-7 leading-tight tracking-tight">
                {t('about.story.title')}
              </h2>
              <p className="text-slate-400 leading-relaxed mb-5 text-[15px]">
                {t('about.story.p1')}
              </p>
              <p className="text-slate-400 leading-relaxed mb-9 text-[15px]">
                {t('about.story.p2')}
              </p>
              {/* Location chips */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: MapPin, label: t('about.story.loc1') },
                  { icon: Globe, label: t('about.story.loc2') },
                  { icon: Wifi, label: t('about.story.loc3') },
                ].map(({ icon: Icon, label }) => (
                  <span key={label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-slate-300"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Icon className="w-3.5 h-3.5 text-violet-400" />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right: quote card */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Outer glow */}
              <div className="absolute -inset-px rounded-[28px] pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(168,85,247,0.15) 100%)' }} />
              <div className="relative premium-surface-featured rounded-3xl p-10 overflow-hidden">
                <div className="absolute inset-0 premium-shimmer pointer-events-none" />
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.7), transparent)' }} />

                <div className="relative z-10">
                  {/* Big quote mark */}
                  <div className="text-8xl font-black leading-none text-violet-900/60 mb-4 font-serif">"</div>
                  <p className="text-white text-xl font-medium leading-relaxed mb-8 italic">
                    {t('about.story.quote')}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                      <span className="text-white font-black text-sm">MB</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Mounir Banni</div>
                      <div className="text-violet-400 text-xs">Founder, MBN DEV</div>
                    </div>
                  </div>

                  {/* Mini stats row */}
                  <div className="mt-8 pt-7 border-t border-violet-500/20 grid grid-cols-3 gap-4">
                    {[
                      { val: '5+', lab: 'Years' },
                      { val: '40+', lab: 'Projects' },
                      { val: '3', lab: 'Languages' },
                    ].map(({ val, lab }) => (
                      <div key={lab} className="text-center">
                        <div className="text-2xl font-black text-white">{val}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{lab}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ──────────────────────────────────────────────── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-violet-400 mb-3 block">
              {t('about.values.eyebrow')}
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
              {t('about.values.title')}
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-[15px] leading-relaxed">
              {t('about.values.sub')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  {...fadeUp}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="premium-surface rounded-2xl p-7 group hover:border-violet-500/30 transition-colors duration-300 relative overflow-hidden"
                >
                  {/* Hover beam */}
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)' }} />

                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <Icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-3">{v.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SKILLS & TECH ────────────────────────────────────────────── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            {/* Skills */}
            <motion.div {...fadeUp}>
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-violet-400 mb-3 block">
                {t('about.skills.eyebrow')}
              </span>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">{t('about.skills.title')}</h2>
              <p className="text-slate-500 mb-9 leading-relaxed text-sm">{t('about.skills.subtitle')}</p>
              <div className="space-y-5">
                {skills.map((s, i) => (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.6 }}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300 font-medium">{s.name}</span>
                      <span className="text-slate-600 tabular-nums">{s.level}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: i * 0.07 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tech */}
            <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-violet-400 mb-3 block">
                {t('about.tech.eyebrow')}
              </span>
              <h2 className="text-3xl font-black text-white mb-9 tracking-tight">{t('about.tech.title')}</h2>
              <div className="grid grid-cols-4 gap-3">
                {technologies.map((tech, i) => {
                  const Icon = tech.icon;
                  return (
                    <motion.div
                      key={tech.label}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, duration: 0.5 }}
                      className="premium-surface rounded-xl p-3 text-center group hover:border-violet-500/30 transition-colors duration-200"
                    >
                      <Icon className="w-5 h-5 text-slate-500 group-hover:text-violet-400 mx-auto mb-2 transition-colors" />
                      <div className="text-slate-600 text-[10px] font-medium">{tech.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHY SOLO EXPERT ──────────────────────────────────────────── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div {...fadeUp} className="mb-14">
            <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-violet-400 mb-3 block">
              {t('about.solo.eyebrow')}
            </span>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight max-w-lg leading-tight">
                {t('about.solo.title')}
              </h2>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed lg:text-right">
                {t('about.solo.sub')}
              </p>
            </div>
          </motion.div>

          {/* 4 point cards */}
          <div className="grid sm:grid-cols-2 gap-5">
            {soloPoints.map((pt, i) => {
              const Icon = pt.icon;
              return (
                <motion.div
                  key={pt.title}
                  {...fadeUp}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="premium-surface rounded-2xl p-7 flex gap-5 group hover:border-violet-500/25 transition-colors duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)' }} />

                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <Icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base mb-2">{pt.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{pt.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── VISION & MISSION ─────────────────────────────────────────── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {[
            {
              label: t('about.vision.label'),
              title: t('about.vision.title'),
              desc: t('about.vision.desc'),
              featured: true,
            },
            {
              label: t('about.mission.label'),
              title: t('about.mission.title'),
              desc: t('about.mission.desc'),
              featured: false,
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              {...fadeUp}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={`relative rounded-2xl p-8 overflow-hidden ${item.featured ? 'premium-surface-featured' : 'premium-surface'}`}
            >
              {item.featured && <div className="absolute inset-0 premium-shimmer pointer-events-none" />}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: item.featured
                  ? 'linear-gradient(90deg, transparent, rgba(168,85,247,0.7), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />
              <div className="relative z-10">
                <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-violet-400 mb-3 block">
                  {item.label}
                </span>
                <h3 className="text-xl font-bold text-white mb-4 leading-snug">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────────────── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-violet-400 mb-3 block">
              {t('about.timeline.eyebrow')}
            </span>
            <h2 className="text-4xl font-black text-white tracking-tight">{t('about.timeline.title')}</h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[52px] top-3 bottom-3 w-px"
              style={{ background: 'linear-gradient(to bottom, rgba(124,58,237,0.3), rgba(124,58,237,0.05))' }} />

            <div className="space-y-6">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-5 items-start"
                >
                  {/* Year */}
                  <div className="w-14 text-right shrink-0 pt-3.5">
                    <span className="text-violet-400 text-xs font-bold tabular-nums">{item.year}</span>
                  </div>

                  {/* Dot */}
                  <div className="relative flex-shrink-0 pt-3.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-violet-500"
                      style={{ boxShadow: '0 0 12px rgba(124,58,237,0.5)' }} />
                  </div>

                  {/* Card */}
                  <div className="premium-surface rounded-2xl p-5 flex-1 group hover:border-violet-500/25 transition-colors duration-200">
                    <div className="text-white font-semibold text-sm mb-1.5">{item.title}</div>
                    <div className="text-slate-500 text-sm leading-relaxed">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-violet-400 mb-3 block">
              {t('about.faq.eyebrow')}
            </span>
            <h2 className="text-4xl font-black text-white tracking-tight">{t('about.faq.title')}</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="premium-surface rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left group"
                >
                  <span className="text-white font-semibold text-sm leading-snug">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="w-4 h-4 text-violet-400" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-6">
                        <div className="h-px mb-5"
                          style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.3), transparent)' }} />
                        <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeUp}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Outer glow ring */}
            <div className="absolute -inset-px rounded-[28px] pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.45) 0%, rgba(168,85,247,0.15) 100%)' }} />
            <div className="relative premium-surface-featured rounded-3xl p-12 text-center overflow-hidden">
              <div className="absolute inset-0 premium-shimmer pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.8), transparent)' }} />

              {/* Check list */}
              <div className="relative z-10">
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-10">
                  {['Fixed quote upfront', 'Source code delivered', 'Direct developer access'].map((item) => (
                    <span key={item} className="flex items-center gap-2 text-slate-400 text-xs">
                      <Check className="w-3.5 h-3.5 text-violet-400" strokeWidth={2.5} />
                      {item}
                    </span>
                  ))}
                </div>

                <h2 className="text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight">
                  {t('about.cta.title')}
                </h2>
                <p className="text-slate-400 mb-10 text-[15px]">{t('about.cta.sub')}</p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/request">
                    <button
                      className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-300 group"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        boxShadow: '0 8px 28px rgba(124,58,237,0.4)',
                      }}
                    >
                      {t('about.cta.start')}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button
                      className="px-7 py-3.5 rounded-2xl text-sm font-semibold text-slate-300 transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {t('about.cta.contact')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </PublicLayout>
  );
}
