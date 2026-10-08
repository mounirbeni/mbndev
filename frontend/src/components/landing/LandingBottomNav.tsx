'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m as motion, AnimatePresence } from 'framer-motion';
import {
  Home, Briefcase, DollarSign, Sparkles, LayoutGrid, MapPin, Mail, MessageCircle, ChevronRight, X,
  FolderOpen, BookOpen, Info, Users, Globe, ShoppingBag, AppWindow, LayoutTemplate, Wrench, Shield, FileText,
  type LucideIcon,
} from 'lucide-react';
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
        <AnimatePresence>{moreOpen && <MoreSheet pathname={pathname} onClose={() => setMoreOn(null)} />}</AnimatePresence>,
        document.body,
      )}
    </nav>
  );
}

const PAGE_ICONS: Record<string, LucideIcon> = {
  '/': Home, '/services': Briefcase, '/portfolio': FolderOpen, '/insights': BookOpen, '/products': Sparkles,
  '/pricing': DollarSign, '/about': Info, '/contact': Mail, '/careers': Users,
};
const SERVICE_ICONS: LucideIcon[] = [Globe, ShoppingBag, AppWindow, LayoutTemplate, Wrench];

/** One settings-style row: icon + label, optional trailing chevron. */
function Row({ icon: Icon, label, href, external, active, onClick }: {
  icon: LucideIcon | (() => React.JSX.Element); label: string; href?: string; external?: boolean; active?: boolean; onClick?: () => void;
}) {
  const inner = (
    <>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center ${active ? 'text-violet-300' : 'text-violet-300/70'}`}>
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
      </span>
      <span className={`flex-1 text-[15px] ${active ? 'font-semibold text-white' : 'text-slate-200'}`}>{label}</span>
      {href && <ChevronRight className="h-4 w-4 text-slate-600" />}
    </>
  );
  const cls = `flex items-center gap-5 px-5 py-3.5 transition-colors active:bg-white/[0.06] ${active ? 'bg-violet-500/[0.08]' : ''}`;
  if (!href) return <div className={cls}>{inner}</div>;
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
    : <Link href={href} onClick={onClick} aria-current={active ? 'page' : undefined} className={cls}>{inner}</Link>;
}

function Section({ title, children, first }: { title: string; children: React.ReactNode; first?: boolean }) {
  return (
    <section className={first ? '' : 'mt-2 border-t border-white/[0.08]'}>
      <h2 className="px-5 pb-1 pt-5 text-[17px] font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

/** Phone-only full-screen menu with everything that is in the desktop footer. */
function MoreSheet({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const { t } = useLanguage();
  const { quickLinks, serviceLinks, legalLinks, socialLinks, cityLinks } = useFooterLinks();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const isHere = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="More"
      className="lg:hidden fixed inset-0 z-[9990] flex flex-col"
      style={{ background: '#08080b' }}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 34, stiffness: 340, mass: 0.9 }}
    >
      {/* Header */}
      <header className="flex shrink-0 items-center gap-4 border-b border-white/[0.06] px-3 pb-3" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full text-slate-200 active:bg-white/[0.08]">
          <X className="h-6 w-6" strokeWidth={1.8} />
        </button>
        <p className="text-[20px] font-semibold text-white">More</p>
        <span className="ml-auto mr-2 h-2 w-2 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 shadow-[0_0_10px_rgba(139,92,246,0.7)]" aria-hidden="true" />
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain pb-10">
        <Section title={t('footer.nav')} first>
          {quickLinks.map((l) => (
            <Row key={l.href} icon={PAGE_ICONS[l.href] ?? LayoutGrid} label={l.label} href={l.href} active={isHere(l.href)} onClick={onClose} />
          ))}
        </Section>

        <Section title={t('footer.services')}>
          {serviceLinks.map((l, i) => (
            <Row key={l.label} icon={SERVICE_ICONS[i] ?? Briefcase} label={l.label} href={l.href} onClick={onClose} />
          ))}
        </Section>

        <Section title={t('footer.contact')}>
          <Row icon={MessageCircle} label={t('footer.chat')} href="https://wa.me/212601439975" external />
          <Row icon={Mail} label="contact@mbndev.ma" href="mailto:contact@mbndev.ma" external />
          <Row icon={FileText} label={t('footer.email')} href="/contact" onClick={onClose} />
          <Row icon={MapPin} label={t('footer.location')} />
        </Section>

        <Section title="Follow us">
          {socialLinks.map(({ href, label, Icon }) => (
            <Row key={label} icon={() => <Icon />} label={label} href={href} external />
          ))}
        </Section>

        <Section title="We work in">
          {cityLinks.map((c) => (
            <Row key={c.href} icon={MapPin} label={c.label} href={c.href} active={isHere(c.href)} onClick={onClose} />
          ))}
        </Section>

        <Section title="Legal">
          {legalLinks.map((l, i) => (
            <Row key={l.href} icon={i === 0 ? Shield : FileText} label={l.label} href={l.href} active={isHere(l.href)} onClick={onClose} />
          ))}
        </Section>

        <div className="mt-4 border-t border-white/[0.08] px-5 pt-5 text-xs text-slate-500">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">{t('footer.payments')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['PAYPAL', 'BANK TRANSFER', 'TAPTAPSEND'].map((m) => (
              <span key={m} className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-400">{m}</span>
            ))}
          </div>
          <p className="mt-4 leading-relaxed">{t('footer.secure')} · {t('footer.response')} · Morocco &amp; Worldwide</p>
          <p className="mt-3 text-slate-600">© {new Date().getFullYear()} MBN DEV. {t('footer.rights')}</p>
        </div>
      </div>
    </motion.div>
  );
}
