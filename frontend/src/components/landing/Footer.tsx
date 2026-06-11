'use client';

import {
  Zap, MapPin, Mail,
  ShieldCheck, MessageCircle, ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import Logo3D from '@/components/ui/Logo3D';
import { useLanguage } from '@/contexts/LanguageContext';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

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
    { label: t('nav.home'),      href: '/'          },
    { label: t('nav.services'),  href: '/services'  },
    { label: t('nav.portfolio'), href: '/portfolio' },
    { label: t('nav.pricing'),   href: '/pricing'   },
    { label: t('nav.about'),     href: '/about'     },
    { label: t('nav.contact'),   href: '/contact'   },
    { label: 'Careers',          href: '/careers'   },
  ];

  const serviceLinks = [
    { label: 'Custom Websites',       href: '/services'  },
    { label: 'E-Commerce Stores',     href: '/services'  },
    { label: 'Web Applications',      href: '/services'  },
    { label: 'Landing Pages',         href: '/services'  },
    { label: 'Maintenance & Support', href: '/services'  },
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
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { href: 'https://github.com/mounirbeni', label: 'GitHub',    Icon: GitHubIcon    },
                { href: 'https://www.linkedin.com/in/mounir-banni', label: 'LinkedIn',  Icon: LinkedInIcon  },
                { href: 'https://instagram.com/mbndev.ma', label: 'Instagram', Icon: InstagramIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <Icon />
                </a>
              ))}
            </div>
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
                href="/contact"
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
