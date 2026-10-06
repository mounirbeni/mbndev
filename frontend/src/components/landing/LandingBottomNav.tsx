'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, DollarSign, Sparkles, LayoutGrid, MapPin, Mail, MessageCircle, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFooterLinks } from '@/components/landing/Footer';

const tabs = [
  { href: '/',          icon: Home,       label: 'Home'      },
  { href: '/services',  icon: Briefcase,  label: 'Services'  },
  { href: '/products',  icon: Sparkles,   label: 'Products'  },
  { href: '/pricing',   icon: DollarSign, label: 'Pricing'   },
];

export default function LandingBottomNav() {
  const pathname = usePathname();
  const haptic   = useHaptic();

  // The More sheet belongs to the page it was opened on, so navigating closes it.
  const [moreOn, setMoreOn] = useState<string | null>(null);
  const moreOpen = moreOn === pathname;

  const isActive = (href: string) =>
    !moreOpen && (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav
      aria-label="Main navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background:           'rgba(6, 6, 9, 0.96)',
        backdropFilter:       'blur(40px) saturate(2)',
        WebkitBackdropFilter: 'blur(40px) saturate(2)',
        borderTop:            '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      {/* Brand hairline along the top edge */}
      <div
        className="absolute top-0 left-6 right-6 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.35), rgba(59,130,246,0.25), transparent)' }}
      />

      <div
        className="flex items-stretch justify-around"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon   = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => haptic('selection')}
              className="relative flex flex-col items-center justify-center gap-[3px] flex-1 py-2.5 min-h-[58px] select-none"
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator — slides between tabs */}
              {active && (
                <motion.div
                  layoutId="landing-tab-indicator"
                  className="absolute top-0 rounded-full"
                  style={{
                    width:      22,
                    height:     2.5,
                    background: 'linear-gradient(90deg, #8b5cf6, #c4b5fd)',
                    boxShadow:  '0 0 10px rgba(139,92,246,0.5)',
                  }}
                  transition={{ type: 'spring', damping: 26, stiffness: 380, mass: 0.5 }}
                />
              )}

              {/* Soft glow bubble — slides with the active tab */}
              {active && (
                <motion.div
                  layoutId="landing-tab-glow"
                  className="absolute rounded-2xl pointer-events-none"
                  style={{
                    inset: '6px 10px',
                    background: 'radial-gradient(ellipse 70% 60% at 50% 38%, rgba(124,58,237,0.14), transparent 75%)',
                  }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.6 }}
                />
              )}

              {/* Icon — springs on activation, squishes on press */}
              <motion.div
                className="relative flex items-center justify-center w-[26px] h-[26px]"
                whileTap={{ scale: 0.82 }}
                transition={{ type: 'spring', damping: 18, stiffness: 400 }}
              >
                <motion.div
                  animate={active ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 340, mass: 0.6 }}
                >
                  <Icon
                    style={{
                      width:    21,
                      height:   21,
                      color:    active ? '#c4b5fd' : 'rgba(100,116,139,0.55)',
                      filter:   active ? 'drop-shadow(0 0 6px rgba(196,181,253,0.3))' : undefined,
                      transition: 'color 0.2s, filter 0.2s',
                    }}
                    strokeWidth={active ? 2 : 1.6}
                  />
                </motion.div>
              </motion.div>

              {/* Label */}
              <span
                style={{
                  fontSize:   10,
                  lineHeight: 1,
                  fontWeight: active ? 600 : 400,
                  color:      active ? '#c4b5fd' : 'rgba(100,116,139,0.65)',
                  transition: 'color 0.2s',
                  letterSpacing: '0.01em',
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* More — everything that is in the footer on desktop */}
        <button
          type="button"
          onClick={() => { haptic('selection'); setMoreOn(moreOpen ? null : pathname); }}
          aria-expanded={moreOpen}
          aria-label={moreOpen ? 'Close menu' : 'More'}
          className="relative flex flex-col items-center justify-center gap-[3px] flex-1 py-2.5 min-h-[58px] select-none"
        >
          {moreOpen && (
            <motion.div
              layoutId="landing-tab-indicator"
              className="absolute top-0 rounded-full"
              style={{ width: 22, height: 2.5, background: 'linear-gradient(90deg, #8b5cf6, #c4b5fd)', boxShadow: '0 0 10px rgba(139,92,246,0.5)' }}
              transition={{ type: 'spring', damping: 26, stiffness: 380, mass: 0.5 }}
            />
          )}
          <LayoutGrid style={{ width: 21, height: 21, color: moreOpen ? '#c4b5fd' : 'rgba(100,116,139,0.55)', transition: 'color 0.2s' }} strokeWidth={moreOpen ? 2 : 1.6} />
          <span style={{ fontSize: 10, lineHeight: 1, fontWeight: moreOpen ? 600 : 400, color: moreOpen ? '#c4b5fd' : 'rgba(100,116,139,0.65)', letterSpacing: '0.01em' }}>
            More
          </span>
        </button>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>{moreOpen && <MoreSheet onClose={() => setMoreOn(null)} />}</AnimatePresence>,
        document.body,
      )}
    </nav>
  );
}

/** Phone-only sheet with the footer's links, contact and legal info. */
function MoreSheet({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { quickLinks, serviceLinks, legalLinks, socialLinks, cityLinks } = useFooterLinks();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const navBottom = 'calc(max(env(safe-area-inset-bottom, 0px), 10px) + 58px)';
  const heading = 'text-[11px] font-semibold uppercase tracking-widest text-slate-500';

  return (
    <>
      <motion.div
        key="more-backdrop"
        className="lg:hidden fixed inset-0 z-[9985]"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        key="more-sheet"
        role="dialog"
        aria-label="More"
        className="lg:hidden fixed inset-x-0 z-[9990] overflow-y-auto overscroll-contain rounded-t-3xl px-5 pb-6 pt-5"
        style={{
          bottom: navBottom,
          maxHeight: `calc(100dvh - ${navBottom} - 64px)`,
          background: '#0a0a10',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -16px 60px rgba(0,0,0,0.6)',
        }}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.8 }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

        <p className={heading}>{t('footer.nav')}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {quickLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={onClose}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-slate-200 active:bg-white/[0.08]">
              {l.label}
            </Link>
          ))}
        </div>

        <p className={`${heading} mt-6`}>{t('footer.services')}</p>
        <ul className="mt-2 space-y-1">
          {serviceLinks.map((l) => (
            <li key={l.label}><Link href={l.href} onClick={onClose} className="block py-1.5 text-sm text-slate-400">{l.label}</Link></li>
          ))}
        </ul>

        <p className={`${heading} mt-6`}>{t('footer.contact')}</p>
        <ul className="mt-2 space-y-2 text-sm text-slate-400">
          <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{t('footer.location')}</li>
          <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" /><a href="mailto:contact@mbndev.ma">contact@mbndev.ma</a></li>
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#25D366]/20 bg-[#25D366]/10 px-3 py-2.5 text-xs font-semibold text-[#25D366]">
            <MessageCircle className="h-3.5 w-3.5" />{t('footer.chat')}<ArrowUpRight className="h-3 w-3 opacity-60" />
          </a>
          <Link href="/contact" onClick={onClose}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-primary-500/15 bg-primary-500/8 px-3 py-2.5 text-xs font-semibold text-primary-400">
            <Mail className="h-3.5 w-3.5" />{t('footer.email')}
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {socialLinks.map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400">
              <Icon />
            </a>
          ))}
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
          <span>Serving:</span>
          {cityLinks.map((c, i) => (
            <span key={c.href} className="flex items-center gap-2">
              {i > 0 && <span>·</span>}
              <Link href={c.href} onClick={onClose} className="text-slate-500">{c.label}</Link>
            </span>
          ))}
        </p>

        <p className={`${heading} mt-6`}>{t('footer.payments')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {['PAYPAL', 'BANK TRANSFER', 'TAPTAPSEND'].map((p) => (
            <span key={p} className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-400">{p}</span>
          ))}
        </div>
        <ul className="mt-3 space-y-1.5 text-xs">
          {[
            { Icon: ShieldCheck, label: t('footer.secure'),   sub: 'End-to-end encrypted' },
            { Icon: Zap,         label: t('footer.response'), sub: 'Guaranteed' },
            { Icon: MapPin,      label: 'Morocco & Worldwide', sub: t('footer.remote') },
          ].map(({ Icon, label, sub }) => (
            <li key={label} className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 shrink-0 text-primary-400" /><span className="font-semibold text-slate-400">{label}</span><span className="text-slate-600">— {sub}</span></li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} MBN DEV. {t('footer.rights')}</span>
          <span className="flex gap-4">
            {legalLinks.map((l) => <Link key={l.href} href={l.href} onClick={onClose} className="text-slate-500">{l.label}</Link>)}
          </span>
        </div>
      </motion.div>
    </>
  );
}
