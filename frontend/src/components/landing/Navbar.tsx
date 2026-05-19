'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu, X, Zap, Home, Briefcase, FolderOpen, DollarSign,
  Info, Mail, LayoutDashboard, ChevronRight, LogIn,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptic } from '@/hooks/useHaptic';

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const { user }   = useAuth();
  const { t }      = useLanguage();
  const pathname   = usePathname();
  const haptic     = useHaptic();
  const sheetRef   = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);

  const navLinks = [
    { label: t('nav.home'),      href: '/',          icon: Home },
    { label: t('nav.services'),  href: '/services',  icon: Briefcase },
    { label: t('nav.portfolio'), href: '/portfolio', icon: FolderOpen },
    { label: t('nav.pricing'),   href: '/pricing',   icon: DollarSign },
    { label: t('nav.about'),     href: '/about',     icon: Info },
    { label: t('nav.contact'),   href: '/contact',   icon: Mail },
  ];

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const openMenu = () => { haptic('light'); setMenuOpen(true); };
  const closeMenu = () => { haptic('light'); setMenuOpen(false); };

  /* Drag-down to dismiss the mobile sheet */
  const onSheetTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };
  const onSheetTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - dragStartY.current;
    if (delta > 70) closeMenu();
    dragStartY.current = null;
  };

  return (
    <>
      {/* ── Main navbar ────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 glass-nav transition-shadow duration-300"
        style={{ boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.35)' : 'none' }}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
        >
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center group-active:scale-95 transition-transform shrink-0">
                <Image src="/images/logo.png" alt="MBN DEV" width={36} height={36} className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-white font-bold text-[15px] leading-none">MBN DEV</div>
                <div className="text-slate-500 text-[10px] leading-none mt-0.5">by Mounir Banni</div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 text-sm rounded-lg transition-all duration-150 ${
                    isActive(link.href)
                      ? 'text-white bg-white/10 font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              {mounted && user ? (
                <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}>
                  <Button size="md">Dashboard →</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="md">{t('nav.login')}</Button>
                  </Link>
                  <Link href="/request">
                    <Button size="md">{t('nav.request')} →</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger — CSS-based swap avoids SSR hydration mismatch */}
            <button
              onClick={menuOpen ? closeMenu : openMenu}
              className="lg:hidden touch-target rounded-xl text-slate-400 hover:text-white
                         active:bg-white/8 transition-colors relative"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className="w-6 h-6 relative block">
                <Menu
                  className={`w-6 h-6 absolute inset-0 transition-all duration-200 ${
                    menuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                  }`}
                />
                <X
                  className={`w-6 h-6 absolute inset-0 transition-all duration-200 ${
                    menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile bottom-sheet menu ────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-40 bg-black/65 lg:hidden"
              style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              onClick={closeMenu}
            />

            {/* Bottom sheet panel */}
            <motion.div
              key="nav-sheet"
              ref={sheetRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340, mass: 0.85 }}
              onTouchStart={onSheetTouchStart}
              onTouchEnd={onSheetTouchEnd}
              className="fixed left-0 right-0 bottom-0 z-50 lg:hidden"
              style={{
                background:           'rgba(12, 12, 16, 0.98)',
                backdropFilter:       'blur(32px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
                borderTop:            '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius:         '24px 24px 0 0',
                paddingBottom:        'max(env(safe-area-inset-bottom), 16px)',
              }}
            >
              {/* Drag handle */}
              <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1" />

              {/* Nav links */}
              <div className="px-3 pt-3 pb-2">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
                  Navigation
                </p>
                {navLinks.map((link, i) => {
                  const Icon   = link.icon;
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.035, duration: 0.18 }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className={`flex items-center gap-3.5 px-3 py-3.5 rounded-2xl mb-0.5 transition-all press-dim ${
                          active
                            ? 'bg-primary-500/15 border border-primary-500/25 text-white'
                            : 'text-slate-300 border border-transparent active:bg-white/6'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-primary-500/20' : 'bg-white/6'
                        }`}>
                          <Icon className={`w-4.5 h-4.5 ${active ? 'text-primary-400' : 'text-slate-400'}`} />
                        </div>
                        <span className="font-medium text-[15px] flex-1">{link.label}</span>
                        {active
                          ? <div className="w-2 h-2 rounded-full bg-primary-400 shrink-0" />
                          : <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                        }
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/6 mx-4 my-1" />

              {/* CTA section */}
              <div className="px-3 pt-2 pb-1 flex flex-col gap-2">
                {mounted && user ? (
                  <Link
                    href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}
                    onClick={closeMenu}
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5 bg-primary-500/15 border border-primary-500/25 rounded-2xl press-dim">
                      <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                        <LayoutDashboard className="w-4 h-4 text-primary-400" />
                      </div>
                      <span className="text-white font-semibold text-[15px]">Go to Dashboard</span>
                      <ChevronRight className="ml-auto w-4 h-4 text-primary-400" />
                    </div>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMenu}>
                      <div className="flex items-center gap-3 px-4 py-3.5 bg-white/5 border border-white/8 rounded-2xl press-dim">
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                          <LogIn className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-white font-medium text-[15px]">{t('nav.login')}</span>
                        <ChevronRight className="ml-auto w-4 h-4 text-slate-600" />
                      </div>
                    </Link>
                    <Link href="/request" onClick={closeMenu}>
                      <div className="flex items-center justify-center gap-2 px-4 py-4 bg-primary-500 rounded-2xl press-scale shadow-lg shadow-primary-500/30 mt-1">
                        <Zap className="w-4 h-4 text-white" />
                        <span className="text-white font-bold text-[15px]">{t('nav.request')} →</span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
