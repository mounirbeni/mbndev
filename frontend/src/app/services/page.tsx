'use client';
// v3 — market-researched pricing with smart discount strategy
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Globe, ShoppingCart, BarChart3, Rocket, Settings, Wrench,
  Check, ArrowRight, Zap, Shield, Clock, Flame, Tag, Trophy, Star, TrendingDown,
} from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

// Market research sources: Upwork, Fiverr Pro, GoodFirms, Clutch — 2026
// Freelancer avg rates used as "original price" for credible comparisons

function discountPct(original: number, current: number) {
  return Math.round((1 - current / original) * 100);
}

export default function ServicesPage() {
  const { t } = useLanguage();

  const services = [
    {
      icon: Globe,
      title: t('services.web.title'),
      tagline: t('services.web.tagline'),
      description: t('services.web.desc'),
      features: [
        t('services.web.f1'), t('services.web.f2'), t('services.web.f3'),
        t('services.web.f4'), t('services.web.f5'), t('services.web.f6'),
      ],
      price: 799,
      originalPrice: 1499,
      badge: 'Limited Offer',
      badgeIcon: Flame,
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      slug: 'custom-websites',
      detailPage: true,
      color: 'from-primary-500/20 to-blue-500/10',
      border: 'border-primary-500/30',
    },
    {
      icon: ShoppingCart,
      title: t('services.ecom.page.title'),
      tagline: t('services.ecom.page.tagline'),
      description: t('services.ecom.page.desc'),
      features: [
        t('services.ecom.page.f1'), t('services.ecom.page.f2'), t('services.ecom.page.f3'),
        t('services.ecom.page.f4'), t('services.ecom.page.f5'), t('services.ecom.page.f6'),
      ],
      price: 1499,
      originalPrice: 2999,
      badge: 'Best Deal',
      badgeIcon: Tag,
      badgeClass: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
      slug: 'ecommerce',
      detailPage: true,
      color: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30',
    },
    {
      icon: BarChart3,
      title: t('services.saas.page.title'),
      tagline: t('services.saas.page.tagline'),
      description: t('services.saas.page.desc'),
      features: [
        t('services.saas.page.f1'), t('services.saas.page.f2'), t('services.saas.page.f3'),
        t('services.saas.page.f4'), t('services.saas.page.f5'), t('services.saas.page.f6'),
      ],
      price: 2499,
      originalPrice: 4999,
      badge: 'Most Popular',
      badgeIcon: Star,
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      slug: 'saas',
      detailPage: false,
      color: 'from-purple-500/20 to-primary-500/10',
      border: 'border-purple-500/30',
    },
    {
      icon: Rocket,
      title: t('services.landing.page.title'),
      tagline: t('services.landing.page.tagline'),
      description: t('services.landing.page.desc'),
      features: [
        t('services.landing.page.f1'), t('services.landing.page.f2'), t('services.landing.page.f3'),
        t('services.landing.page.f4'), t('services.landing.page.f5'), t('services.landing.page.f6'),
      ],
      price: 499,
      originalPrice: 899,
      badge: 'Quick Launch',
      badgeIcon: Zap,
      badgeClass: 'bg-green-500/20 text-green-300 border-green-500/30',
      slug: 'landing-pages',
      detailPage: true,
      color: 'from-green-500/20 to-emerald-500/10',
      border: 'border-green-500/30',
    },
    {
      icon: Settings,
      title: t('services.webapp.page.title'),
      tagline: t('services.webapp.page.tagline'),
      description: t('services.webapp.page.desc'),
      features: [
        t('services.webapp.page.f1'), t('services.webapp.page.f2'), t('services.webapp.page.f3'),
        t('services.webapp.page.f4'), t('services.webapp.page.f5'), t('services.webapp.page.f6'),
      ],
      price: 1999,
      originalPrice: 3999,
      badge: 'Best Value',
      badgeIcon: Trophy,
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      slug: 'web-applications',
      detailPage: true,
      color: 'from-orange-500/20 to-yellow-500/10',
      border: 'border-orange-500/30',
    },
    {
      icon: Wrench,
      title: t('services.maint.page.title'),
      tagline: t('services.maint.page.tagline'),
      description: t('services.maint.page.desc'),
      features: [
        t('services.maint.page.f1'), t('services.maint.page.f2'), t('services.maint.page.f3'),
        t('services.maint.page.f4'), t('services.maint.page.f5'), t('services.maint.page.f6'),
      ],
      price: 149,
      originalPrice: 299,
      isMonthly: true,
      badge: 'Flexible Plans',
      badgeIcon: Shield,
      badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      slug: 'maintenance',
      detailPage: true,
      color: 'from-slate-500/20 to-slate-600/10',
      border: 'border-slate-500/30',
    },
  ];

  const highlights = [
    { icon: Zap,    label: t('services.hl.fast.label'),     desc: t('services.hl.fast.desc') },
    { icon: Shield, label: t('services.hl.secure.label'),   desc: t('services.hl.secure.desc') },
    { icon: Clock,  label: t('services.hl.response.label'), desc: t('services.hl.response.desc') },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-6">
              <Zap className="w-3 h-3 text-primary-400" /> {t('services.page.badge')}
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t('services.page.title1')}<br />
              <span className="gradient-text">{t('services.page.title2')}</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-4">
              {t('services.page.subtitle')}{' '}
              <span className="text-green-400 font-semibold">{t('services.page.subtitlePct')}</span>{' '}
              {t('services.page.subtitleEnd')}
            </p>
            {/* Market comparison trust bar */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-10">
              <TrendingDown className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 text-xs font-medium">{t('services.page.trust')}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {highlights.map((h) => (
                <div key={h.label} className="flex items-center gap-2 text-slate-400">
                  <h.icon className="w-4 h-4 text-primary-400" />
                  <span className="text-sm"><span className="text-white font-medium">{h.label}</span> — {h.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              const BadgeIcon = svc.badgeIcon;
              const pct = discountPct(svc.originalPrice, svc.price);
              const href = svc.detailPage ? `/services/${svc.slug}` : `/request?service=${svc.slug}`;
              const priceLabel = svc.isMonthly
                ? `$${svc.price}${t('services.page.perMo')}`
                : `${t('services.page.from')} $${svc.price.toLocaleString()}`;
              const origLabel = svc.isMonthly
                ? `$${svc.originalPrice}${t('services.page.perMo')}`
                : `$${svc.originalPrice.toLocaleString()}`;
              const saveAmt = (svc.originalPrice - svc.price).toLocaleString();
              const saveLabel = svc.isMonthly
                ? t('services.page.savePerMo').replace('{amount}', `$${saveAmt}`)
                : t('services.page.saveVsMarket').replace('{amount}', `$${saveAmt}`);

              return (
                <motion.div
                  key={svc.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={href} className="block h-full">
                    <div className={`glass rounded-2xl p-8 border ${svc.border} bg-gradient-to-br ${svc.color} flex flex-col group hover:scale-[1.02] transition-transform duration-300 h-full cursor-pointer relative overflow-hidden`}>

                      {/* Discount % pill — top right */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                          -{pct}%
                        </span>
                      </div>

                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Promo badge */}
                      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mb-3 w-fit ${svc.badgeClass}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {svc.badge}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-1">{svc.title}</h3>
                      <p className="text-primary-400 text-sm mb-3 font-medium">{svc.tagline}</p>
                      <p className="text-slate-400 text-sm mb-5 leading-relaxed flex-1">{svc.description}</p>

                      <ul className="space-y-2 mb-6">
                        {svc.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                            <Check className="w-3.5 h-3.5 text-primary-400 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>

                      {/* Price block */}
                      <div className="pt-4 border-t border-white/10 mt-auto">
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-slate-500 text-xs line-through">{origLabel}</span>
                              <span className="text-slate-500 text-[10px]">{t('services.page.marketAvg')}</span>
                            </div>
                            <span className="text-white font-bold text-lg">{priceLabel}</span>
                            <p className="text-green-400 text-[10px] font-semibold mt-0.5">
                              {saveLabel}
                            </p>
                          </div>
                          <span className="flex items-center gap-1.5 text-primary-400 text-sm font-medium group-hover:gap-2.5 transition-all">
                            {svc.detailPage ? t('services.page.learnMore') : t('services.page.getStarted')}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 text-center border border-primary-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-blue-500/5 pointer-events-none" />
            <h2 className="text-3xl font-bold text-white mb-3 relative z-10">{t('services.cta.title')}</h2>
            <p className="text-slate-400 mb-8 relative z-10">{t('services.cta.sub')}</p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Link href="/request">
                <Button size="lg" className="group">
                  {t('services.cta.start')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">{t('services.cta.talk')}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
