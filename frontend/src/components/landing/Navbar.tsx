'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo3D from '@/components/ui/Logo3D';
import { Home, Briefcase, FolderOpen, DollarSign, Info, Mail, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [hidden,    setHidden]    = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevScrollY = useRef(0);

  const { user }  = useAuth();
  const { t }     = useLanguage();
  const pathname  = usePathname();
  const { scrollY } = useScroll();

  const navLinks = [
    { label: t('nav.home'),      href: '/',          icon: Home },
    { label: t('nav.services'),  href: '/services',  icon: Briefcase },
    { label: t('nav.portfolio'), href: '/portfolio', icon: FolderOpen },
    { label: t('nav.pricing'),   href: '/pricing',   icon: DollarSign },
    { label: t('nav.about'),     href: '/about',     icon: Info },
    { label: t('nav.contact'),   href: '/contact',   icon: Mail },
  ];

  useEffect(() => { setMounted(true); }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const isScrolled = latest > 30;
    setScrolled(isScrolled);

    // Hide on scroll down, show on scroll up
    if (latest > 80) {
      setHidden(latest > prevScrollY.current && latest > 160);
    } else {
      setHidden(false);
    }
    prevScrollY.current = latest;
  });

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -80 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background:           scrolled ? 'rgba(6, 6, 10, 0.94)' : 'transparent',
          backdropFilter:       scrolled ? 'blur(32px) saturate(1.8)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(32px) saturate(1.8)' : 'none',
          borderBottom:         scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          boxShadow:            scrolled ? '0 4px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.06)' : 'none',
        }}
      >
        {/* Top glow line when scrolled */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.35) 30%, rgba(168,85,247,0.5) 50%, rgba(59,130,246,0.35) 70%, transparent 100%)' }}
            />
          )}
        </AnimatePresence>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
        >
          <div className="flex items-center justify-between h-[62px]">

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Logo3D size="md" />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link, i) => {
                const active = isActive(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      className={`relative px-4 py-2.5 text-[13.5px] rounded-xl transition-all duration-200 font-medium group flex items-center gap-1.5 ${
                        active
                          ? 'text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      style={{
                        background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseLeave={e => {
                        if (!active) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="nav-active-pill"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: 'rgba(124,58,237,0.1)',
                            border: '1px solid rgba(124,58,237,0.18)',
                          }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                      {active && (
                        <motion.div
                          layoutId="nav-active-dot"
                          className="relative z-10 w-1 h-1 rounded-full bg-violet-400 shrink-0"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Right side CTAs */}
            <div className="flex items-center gap-2 lg:gap-3">
              {mounted && user ? (
                <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}>
                  {/* Desktop */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white group cursor-pointer transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(109,40,217,0.9))',
                      boxShadow:  '0 4px 20px rgba(124,58,237,0.35), 0 0 0 1px rgba(124,58,237,0.3)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.boxShadow = '0 6px 28px rgba(124,58,237,0.5), 0 0 0 1px rgba(168,85,247,0.4)';
                      el.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.boxShadow = '0 4px 20px rgba(124,58,237,0.35), 0 0 0 1px rgba(124,58,237,0.3)';
                      el.style.transform = 'none';
                    }}
                  >
                    Dashboard
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </motion.div>

                  {/* Mobile */}
                  <div
                    className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      boxShadow:  '0 4px 14px rgba(124,58,237,0.35)',
                    }}
                  >
                    Dashboard
                  </div>
                </Link>
              ) : (
                <>
                  {/* Desktop */}
                  <Link href="/login" className="hidden lg:block">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="flex items-center px-4 py-2.5 text-[13.5px] font-medium text-slate-400 hover:text-white rounded-xl transition-all duration-200 hover:bg-white/5 cursor-pointer"
                    >
                      {t('nav.login')}
                    </motion.span>
                  </Link>
                  <Link href="/request" className="hidden lg:block">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-white group cursor-pointer transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        boxShadow:  '0 4px 20px rgba(124,58,237,0.35)',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.boxShadow = '0 6px 28px rgba(124,58,237,0.5)';
                        el.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.boxShadow = '0 4px 20px rgba(124,58,237,0.35)';
                        el.style.transform = 'none';
                      }}
                    >
                      {t('nav.request')}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </motion.div>
                  </Link>

                  {/* Mobile: two pills */}
                  <Link
                    href="/login"
                    className="lg:hidden px-3.5 py-2 rounded-full text-sm font-medium text-slate-300 border border-white/10 active:scale-95 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/request"
                    className="lg:hidden flex items-center px-3.5 py-2 rounded-full text-sm font-semibold text-white active:scale-95 transition-transform"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      boxShadow:  '0 4px 14px rgba(124,58,237,0.3)',
                    }}
                  >
                    Start →
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
