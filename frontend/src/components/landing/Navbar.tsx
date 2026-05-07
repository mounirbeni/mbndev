'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, Zap, Home, Briefcase, FolderOpen, DollarSign,
  Info, Mail, LayoutDashboard, ChevronRight, LogIn
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Home',      href: '/',          icon: Home },
  { label: 'Services',  href: '/services',  icon: Briefcase },
  { label: 'Portfolio', href: '/portfolio', icon: FolderOpen },
  { label: 'Pricing',   href: '/pricing',   icon: DollarSign },
  { label: 'About',     href: '/about',     icon: Info },
  { label: 'Contact',   href: '/contact',   icon: Mail },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen ? 'glass-nav shadow-xl shadow-black/30' : 'glass-nav'
        }`}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
        >
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center glow-purple group-active:scale-95 transition-transform">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-[15px] leading-none">MBN DEV</div>
                <div className="text-slate-500 text-[10px] leading-none mt-0.5">by Mounir Banni</div>
              </div>
            </Link>

            {/* Desktop Nav links */}
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
              {user ? (
                <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}>
                  <Button size="md">Dashboard →</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="md">Sign In</Button>
                  </Link>
                  <Link href="/request">
                    <Button size="md">Start Project →</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden touch-target rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile full-screen menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed left-3 right-3 z-50 lg:hidden glass-panel rounded-2xl border border-white/8 overflow-hidden shadow-2xl shadow-black/60"
              style={{ top: 'calc(64px + max(env(safe-area-inset-top), 0px) + 8px)' }}
            >
              {/* Nav links */}
              <div className="px-2 pt-3 pb-2">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Navigation</p>
                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all press-dim ${
                          active
                            ? 'bg-primary-500/15 text-white border border-primary-500/25'
                            : 'text-slate-300 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          active ? 'bg-primary-500/20' : 'bg-white/5'
                        }`}>
                          <Icon className={`w-4 h-4 ${active ? 'text-primary-400' : 'text-slate-400'}`} />
                        </div>
                        <span className="font-medium text-sm">{link.label}</span>
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
                        )}
                        {!active && (
                          <ChevronRight className="ml-auto w-4 h-4 text-slate-600" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/6 mx-3" />

              {/* CTA section */}
              <div className="px-3 py-3 flex flex-col gap-2">
                {user ? (
                  <Link
                    href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3 px-3 py-3 bg-primary-500/15 border border-primary-500/25 rounded-xl press-dim">
                      <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
                        <LayoutDashboard className="w-4 h-4 text-primary-400" />
                      </div>
                      <span className="text-white font-semibold text-sm">Go to Dashboard</span>
                      <ChevronRight className="ml-auto w-4 h-4 text-primary-400" />
                    </div>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-3 bg-white/5 border border-white/8 rounded-xl press-dim">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <LogIn className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-white font-medium text-sm">Sign In</span>
                        <ChevronRight className="ml-auto w-4 h-4 text-slate-600" />
                      </div>
                    </Link>
                    <Link href="/request" onClick={() => setMenuOpen(false)}>
                      <div className="flex items-center justify-center gap-2 px-4 py-3.5 bg-primary-500 rounded-xl press-scale shadow-lg shadow-primary-500/30">
                        <Zap className="w-4 h-4 text-white" />
                        <span className="text-white font-semibold text-sm">Start Your Project</span>
                      </div>
                    </Link>
                  </>
                )}
              </div>

              {/* Safe area bottom padding */}
              <div style={{ height: 'env(safe-area-inset-bottom)' }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
