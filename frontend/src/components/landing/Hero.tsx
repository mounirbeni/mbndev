'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Zap, Shield, Code2, Headphones,
  CheckCircle2, Circle, BarChart2, Sparkles,
} from 'lucide-react';
import {
  SiNextdotjs, SiReact, SiTypescript, SiNodedotjs,
  SiPostgresql, SiTailwindcss, SiMongodb, SiDocker,
  SiPrisma, SiStripe,
} from 'react-icons/si';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

const stack = [
  { label: 'Next.js',     Icon: SiNextdotjs,    hex: '#ffffff' },
  { label: 'React',       Icon: SiReact,        hex: '#61DAFB' },
  { label: 'TypeScript',  Icon: SiTypescript,   hex: '#3178C6' },
  { label: 'Node.js',     Icon: SiNodedotjs,    hex: '#339933' },
  { label: 'PostgreSQL',  Icon: SiPostgresql,   hex: '#4169E1' },
  { label: 'Tailwind',    Icon: SiTailwindcss,  hex: '#06B6D4' },
  { label: 'MongoDB',     Icon: SiMongodb,      hex: '#47A248' },
  { label: 'Docker',      Icon: SiDocker,       hex: '#2496ED' },
  { label: 'Prisma',      Icon: SiPrisma,       hex: '#5A67D8' },
  { label: 'Stripe',      Icon: SiStripe,       hex: '#635BFF' },
];

export default function Hero() {
  const { t } = useLanguage();

  const stats = [
    { icon: Zap,        label: t('hero.stat.fast'),    desc: t('hero.stat.fast.desc') },
    { icon: Shield,     label: t('hero.stat.secure'),  desc: t('hero.stat.secure.desc') },
    { icon: Code2,      label: t('hero.stat.clean'),   desc: t('hero.stat.clean.desc') },
    { icon: Headphones, label: t('hero.stat.support'), desc: t('hero.stat.support.desc') },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-hero-gradient"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pt-20 pb-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center min-h-[calc(100vh-7rem)]">

          {/* ── Left content ─────────────────────────────────────────── */}
          <div className="flex flex-col justify-center">
            <motion.h1
              {...fadeUp(0.2)}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.08] mb-5"
            >
              {t('hero.title.line1')}<br />
              {t('hero.title.line2a')}{' '}
              <span className="gradient-text">{t('hero.title.elevate')}</span>
              <br className="hidden sm:block" />
              {' '}{t('hero.title.line2b')}{' '}
              <span className="gradient-text">{t('hero.title.business')}</span>
            </motion.h1>

            <motion.p {...fadeUp(0.35)} className="text-base sm:text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs — full width on mobile */}
            <motion.div {...fadeUp(0.45)} className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/request" className="w-full sm:w-auto">
                <Button size="lg" className="group w-full sm:w-auto justify-center">
                  {t('hero.cta.primary')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                </Button>
              </Link>
              <a href="#portfolio" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto justify-center">
                  {t('hero.cta.secondary')}
                </Button>
              </a>
            </motion.div>

            {/* Tech stack */}
            <motion.div {...fadeUp(0.55)}>
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                <Code2 className="w-3 h-3 text-slate-600" />
                {t('hero.stack.label')}
              </p>
              <div className="flex flex-wrap gap-2.5 items-center">
                {stack.map(({ label, Icon, hex }) => (
                  <div
                    key={label}
                    title={label}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/8 hover:border-white/20 hover:bg-white/10 transition-all cursor-default"
                  >
                    <Icon style={{ color: hex }} className="w-4 h-4 shrink-0" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right — Dashboard mockup (desktop only) ─────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="animate-float w-full max-w-md">
              <div className="glass rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{t('hero.mock.title')}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{t('hero.mock.subtitle')}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                    <Sparkles className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-xs font-medium">{t('hero.mock.live')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: t('hero.mock.total'),      bg: 'bg-white/5',        text: 'text-white',        bar: 'w-full' },
                    { label: t('hero.mock.inProgress'), bg: 'bg-blue-500/10',    text: 'text-blue-400',     bar: 'w-2/3' },
                    { label: t('hero.mock.completed'),  bg: 'bg-primary-500/10', text: 'text-primary-400',  bar: 'w-1/2' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                      <div className={`${s.text} font-bold text-xl`}>—</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'E-Commerce Store',  progress: 100, isLive: true,  statusColor: 'text-green-400',   bar: 'bg-green-500' },
                    { name: 'Corporate Website', progress: 75,  isLive: false, statusColor: 'text-blue-400',    bar: 'bg-blue-500' },
                    { name: 'SaaS Dashboard',    progress: 40,  isLive: false, statusColor: 'text-blue-400',    bar: 'bg-primary-500' },
                    { name: 'Portfolio Site',    progress: 100, isLive: true,  statusColor: 'text-green-400',   bar: 'bg-green-500' },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        {p.isLive
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          : <Circle className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-xs font-medium truncate">{p.name}</span>
                          <span className={`text-[10px] font-semibold shrink-0 ml-2 ${p.statusColor}`}>{p.isLive ? t('status.live') : t('status.inProgress')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${p.bar} rounded-full`} style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-slate-500 text-[10px] shrink-0">{p.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating mini card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-6 -right-6 glass rounded-xl p-3 w-44"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-white text-xs font-medium">{t('hero.mock.activity')}</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { dot: 'bg-green-500',    text: t('hero.mock.act1') },
                    { dot: 'bg-blue-500',     text: t('hero.mock.act2') },
                    { dot: 'bg-primary-500',  text: t('hero.mock.act3') },
                  ].map((a) => (
                    <div key={a.text} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${a.dot} shrink-0`} />
                      <span className="text-slate-400 text-[10px]">{a.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom stats bar ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="relative z-10 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.08 }}
                  className="glass rounded-xl p-3.5 sm:p-4 flex gap-3 items-start"
                >
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-xs sm:text-sm font-semibold leading-tight">{s.label}</div>
                    <div className="text-slate-500 text-[11px] sm:text-xs mt-0.5 leading-relaxed hidden sm:block">{s.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
