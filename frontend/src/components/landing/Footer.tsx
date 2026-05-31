'use client';

import {
  Zap, MapPin, Mail,
  ShieldCheck, MessageCircle, ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import Logo3D from '@/components/ui/Logo3D';
import { useLanguage } from '@/contexts/LanguageContext';

/** Inline SVG brand-accurate payment method marks */
function PayPalMark() {
  return (
    <svg viewBox="0 0 38 24" className="h-5 w-auto" aria-label="PayPal" fill="none">
      <rect width="38" height="24" rx="4" fill="#1A1F36" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <text x="6" y="16" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="10" fill="#009CDE">Pay</text>
      <text x="18" y="16" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="10" fill="#012169">Pal</text>
    </svg>
  );
}

function PaymentBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-400 tracking-wide">
      {label}
    </span>
  );
}

export default function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { label: t('nav.home'),      href: '/#home'        },
    { label: t('nav.services'),  href: '/#services'    },
    { label: t('nav.portfolio'), href: '/#portfolio'   },
    { label: t('nav.pricing'),   href: '/#pricing'     },
    { label: t('nav.about'),     href: '/#commitments' },
    { label: t('nav.contact'),   href: '/#contact'     },
  ];

  const serviceLinks = [
    { label: 'Custom Websites',       href: '/#services' },
    { label: 'E-Commerce Stores',     href: '/#services' },
    { label: 'Web Applications',      href: '/#services' },
    { label: 'Landing Pages',         href: '/#services' },
    { label: 'Maintenance & Support', href: '/#services' },
  ];

  const legalLinks = [
    { label: t('footer.privacy'), href: '/privacy' },
    { label: t('footer.terms'),   href: '/terms' },
  ];

  const trustBadges = [
    { icon: ShieldCheck, label: t('footer.secure'),   sub: 'End-to-end encrypted' },
    { icon: Zap,         label: t('footer.response'), sub: 'Guaranteed'           },
    { icon: MapPin,      label: 'Morocco & Worldwide', sub: t('footer.remote')    },
  ];

  return (
    <footer className="relative overflow-hidden" style={{ background: 'rgba(4, 4, 8, 0.99)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Footer ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 ambient-grid opacity-15 pointer-events-none" />

      {/* ── Payment + trust row ──────────────────────────────────────────── */}
      <div className="border-b border-white/4 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

            {/* Payment methods */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest shrink-0">
                {t('footer.payments')}
              </span>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <PayPalMark />
                <PaymentBadge label="BANK TRANSFER" />
                <PaymentBadge label="TAPTAPSEND" />
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-5 flex-wrap justify-center">
              {trustBadges.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.label} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                    <div className="leading-none">
                      <span className="text-xs font-semibold text-slate-400">{b.label}</span>
                      <span className="text-[10px] text-slate-600 ml-1">— {b.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 relative z-10">
        <div className="grid lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Logo3D size="md" />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              A Moroccan development studio building production-grade digital
              products for businesses worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('footer.nav')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-slate-500 mb-5">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {t('footer.location')}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <Link href="mailto:contact@mbndev.ma" className="hover:text-slate-300 transition-colors">
                  contact@mbndev.ma
                </Link>
              </li>
            </ul>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/212705914424"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-all group"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {t('footer.chat')}
                <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-500/8 border border-primary-500/15 text-primary-400 text-xs font-semibold hover:bg-primary-500/15 transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                {t('footer.email')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/4 relative z-10">
        {/* Bottom glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3) 50%, transparent)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} MBN DEV. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-slate-600 text-xs">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-slate-400 transition-colors">
                {l.label}
              </Link>
            ))}
            <span className="text-slate-700">{t('footer.built')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
