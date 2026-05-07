'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Zap, Shield, Code2, Headphones,
  MapPin, TrendingUp, CheckCircle2, Circle, BarChart2,
} from 'lucide-react';
import Button from '@/components/ui/Button';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

const stats = [
  { icon: Zap,        label: 'Fast Delivery',        desc: 'We respect deadlines and deliver on time.' },
  { icon: Shield,     label: 'Modern & Secure',       desc: 'Latest tech, best practices always.' },
  { icon: Code2,      label: 'Clean Code',            desc: 'Scalable, maintainable, future-ready.' },
  { icon: Headphones, label: 'Ongoing Support',       desc: 'We stay by your side after delivery.' },
];

const clients = ['inwi', 'CIH BANK', 'Maroc Telecom', 'OCP', 'Société Générale'];

export default function Hero() {
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
            <motion.div {...fadeUp(0.1)}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-5">
                <MapPin className="w-3 h-3 text-primary-400" />
                MOROCCAN PLATFORM
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.08] mb-5"
            >
              Custom Websites<br />
              Built to{' '}
              <span className="gradient-text">Elevate</span>
              <br className="hidden sm:block" />
              {' '}Your{' '}
              <span className="gradient-text">Business.</span>
            </motion.h1>

            <motion.p {...fadeUp(0.35)} className="text-base sm:text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
              MBN DEV is a Moroccan platform by{' '}
              <span className="text-white font-medium">Mounir Banni</span>, dedicated to building
              modern, fast, and high-performing websites tailored to your needs.
            </motion.p>

            {/* CTAs — full width on mobile */}
            <motion.div {...fadeUp(0.45)} className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/request" className="w-full sm:w-auto">
                <Button size="lg" className="group w-full sm:w-auto justify-center">
                  Start Your Project
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#portfolio" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto justify-center">
                  View Our Work
                </Button>
              </a>
            </motion.div>

            {/* Trusted by */}
            <motion.div {...fadeUp(0.55)}>
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-600" />
                Trusted by businesses across Morocco
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                {clients.map((c) => (
                  <span key={c} className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    {c}
                  </span>
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
                    <h3 className="text-white font-semibold text-sm">Project Overview</h3>
                    <p className="text-slate-500 text-xs mt-0.5">All time activity</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full px-3 py-1">
                    <TrendingUp className="w-3 h-3 text-primary-400" />
                    <span className="text-primary-400 text-xs font-medium">+24% this month</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { value: '16', label: 'Total',       bg: 'bg-white/5',        text: 'text-white' },
                    { value: '6',  label: 'In Progress', bg: 'bg-blue-500/10',    text: 'text-blue-400' },
                    { value: '8',  label: 'Completed',   bg: 'bg-primary-500/10', text: 'text-primary-400' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                      <div className={`${s.text} font-bold text-xl`}>{s.value}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'E-Commerce Store',  type: 'E-Commerce', progress: 100, status: 'Live',        statusColor: 'text-green-400',   bar: 'bg-green-500' },
                    { name: 'Corporate Website', type: 'Web Design',  progress: 75,  status: 'In Progress', statusColor: 'text-blue-400',    bar: 'bg-blue-500' },
                    { name: 'SaaS Dashboard',    type: 'Web App',     progress: 40,  status: 'In Progress', statusColor: 'text-blue-400',    bar: 'bg-primary-500' },
                    { name: 'Portfolio Site',    type: 'Portfolio',   progress: 100, status: 'Live',        statusColor: 'text-green-400',   bar: 'bg-green-500' },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        {p.status === 'Live'
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          : <Circle className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-xs font-medium truncate">{p.name}</span>
                          <span className={`text-[10px] font-semibold shrink-0 ml-2 ${p.statusColor}`}>{p.status}</span>
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
                  <span className="text-white text-xs font-medium">Recent Activity</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { dot: 'bg-green-500',    text: 'New project received' },
                    { dot: 'bg-blue-500',     text: 'Design approved' },
                    { dot: 'bg-primary-500',  text: 'Payment received' },
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
