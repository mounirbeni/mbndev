'use client';

import { useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Globe, ShoppingCart, BarChart3, Layout, Smartphone, Settings,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function SpotlightCard({
  children,
  glowColor,
  className = '',
}: {
  children: React.ReactNode;
  glowColor: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      whileHover={{ y: -4, borderColor: `${glowColor}40` }}
      className={`group relative rounded-2xl cursor-default overflow-hidden spotlight-card ${className}`}
      style={{
        background: 'rgba(10,10,16,0.9)',
        border: '1px solid rgba(255,255,255,0.065)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.35)',
        '--mx': '50%',
        '--my': '50%',
      } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(500px circle at var(--mx) var(--my), ${glowColor}12, transparent 55%)`,
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${glowColor}80, transparent)` }}
      />
      {children}
    </motion.div>
  );
}

export default function Services() {
  const { t } = useLanguage();
  const titleRef    = useRef<HTMLDivElement>(null);
  const sectionRef  = useRef<HTMLElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-80px' });

  const services = [
    {
      icon: Globe,
      title:    t('services.custom.title'),
      desc:     t('services.custom.desc'),
      features: [t('services.custom.f1'), t('services.custom.f2'), t('services.custom.f3')],
      glow: '#7c3aed',
      iconBg: 'from-violet-600 to-purple-700',
      label: '01',
    },
    {
      icon: ShoppingCart,
      title:    t('services.ecom.title'),
      desc:     t('services.ecom.desc'),
      features: [t('services.ecom.f1'), t('services.ecom.f2'), t('services.ecom.f3')],
      glow: '#3b82f6',
      iconBg: 'from-blue-500 to-cyan-600',
      label: '02',
    },
    {
      icon: BarChart3,
      title:    t('services.saas.title'),
      desc:     t('services.saas.desc'),
      features: [t('services.saas.f1'), t('services.saas.f2'), t('services.saas.f3')],
      glow: '#ec4899',
      iconBg: 'from-pink-500 to-rose-600',
      label: '03',
    },
    {
      icon: Layout,
      title:    t('services.landing.title'),
      desc:     t('services.landing.desc'),
      features: [t('services.landing.f1'), t('services.landing.f2'), t('services.landing.f3')],
      glow: '#10b981',
      iconBg: 'from-emerald-500 to-teal-600',
      label: '04',
    },
    {
      icon: Smartphone,
      title:    t('services.webapp.title'),
      desc:     t('services.webapp.desc'),
      features: [t('services.webapp.f1'), t('services.webapp.f2'), t('services.webapp.f3')],
      glow: '#f59e0b',
      iconBg: 'from-orange-500 to-amber-600',
      label: '05',
    },
    {
      icon: Settings,
      title:    t('services.maint.title'),
      desc:     t('services.maint.desc'),
      features: [t('services.maint.f1'), t('services.maint.f2'), t('services.maint.f3')],
      glow: '#06b6d4',
      iconBg: 'from-cyan-500 to-sky-600',
      label: '06',
    },
  ];

  const [featured, ...rest] = services;
  const FeaturedIcon = featured.icon;

  return (
    <section ref={sectionRef} id="services" className="py-28 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2) 30%, rgba(168,85,247,0.3) 50%, rgba(59,130,246,0.2) 70%, transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 50%, transparent)' }} />
        <div className="absolute inset-0 ambient-grid opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* Section header */}
        <div ref={titleRef} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center mb-6"
          >
            <span className="section-label">What We Build</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight"
          >
            Our <span className="gradient-text">Services</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            From concept to deployment — we handle everything so you can focus on growing your business.
          </motion.p>
        </div>

        {/* ── Bento Grid ───────────────────────────────────────────────── */}

        {/* Featured card — full width */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5"
        >
          <SpotlightCard glowColor={featured.glow}>
            <div className="flex flex-col md:flex-row p-8 lg:p-10 gap-8">
              {/* Left: icon + visual */}
              <div className="relative md:w-2/5 flex flex-col justify-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${featured.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  style={{ boxShadow: `0 12px 32px ${featured.glow}40` }}
                >
                  <FeaturedIcon className="w-7 h-7 text-white" />
                </div>
                <span className="absolute top-6 right-6 md:top-0 md:right-0 font-black text-8xl leading-none select-none tabular-nums"
                  style={{
                    background: `linear-gradient(135deg, ${featured.glow}18, transparent)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {featured.label}
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-snug tracking-tight group-hover:text-violet-100 transition-colors">
                  {featured.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{featured.desc}</p>
              </div>

              {/* Right: features */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {featured.features.map((f) => (
                    <div
                      key={f}
                      className="rounded-xl p-4"
                      style={{
                        background: `${featured.glow}08`,
                        border: `1px solid ${featured.glow}15`,
                      }}
                    >
                      <span className="text-sm font-medium" style={{ color: `${featured.glow}cc` }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="flex items-center gap-1.5 text-sm font-semibold mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1"
                  style={{ color: featured.glow }}
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Remaining cards — grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpotlightCard glowColor={service.glow}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${service.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        style={{ boxShadow: `0 8px 24px ${service.glow}30` }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold tabular" style={{ color: `${service.glow}60` }}>
                        {service.label}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-lg mb-2 leading-snug group-hover:text-violet-100 transition-colors duration-200">
                      {service.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-5">{service.desc}</p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {service.features.map((f) => (
                        <span
                          key={f}
                          className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                          style={{
                            background: `${service.glow}10`,
                            border: `1px solid ${service.glow}20`,
                            color: `${service.glow}cc`,
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    <div
                      className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1"
                      style={{ color: service.glow }}
                    >
                      Learn more <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-slate-500 text-sm">
            Not sure which service fits?{' '}
            <a href="#contact" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Let&apos;s talk →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
