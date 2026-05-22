'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo3D from '@/components/ui/Logo3D';
import { Home, Briefcase, FolderOpen, DollarSign, Info, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const { user }  = useAuth();
  const { t }     = useLanguage();
  const pathname  = usePathname();

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

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background:           scrolled ? 'rgba(8, 8, 11, 0.92)' : 'transparent',
        backdropFilter:       scrolled ? 'blur(28px) saturate(1.6)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(1.6)' : 'none',
        borderBottom:         scrolled ? '1px solid rgba(255,255,255,0.065)' : '1px solid transparent',
        boxShadow:            scrolled ? '0 4px 32px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
      >
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Logo3D size="md" className="group-active:scale-95 transition-transform" />
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

          {/* Right side CTAs */}
          <div className="flex items-center gap-2 lg:gap-3">
            {mounted && user ? (
              <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}>
                {/* Desktop: full button */}
                <Button size="md" className="hidden lg:flex">Dashboard →</Button>
                {/* Mobile: compact pill */}
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
                  <Button variant="ghost" size="md">{t('nav.login')}</Button>
                </Link>
                <Link href="/request" className="hidden lg:block">
                  <Button size="md">{t('nav.request')} →</Button>
                </Link>

                {/* Mobile: two compact pills */}
                <Link
                  href="/login"
                  className="lg:hidden px-3.5 py-2 rounded-full text-sm font-medium text-slate-300 border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/request"
                  className="lg:hidden flex items-center px-3.5 py-2 rounded-full text-sm font-semibold text-white"
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
  );
}
