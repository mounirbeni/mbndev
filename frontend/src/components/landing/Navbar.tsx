'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo3D from '@/components/ui/Logo3D';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const navLinks = [
  { label: 'Services',  href: '/services'  },
  { label: 'Work',      href: '/portfolio' },
  { label: 'Pricing',   href: '/pricing'   },
  { label: 'About',     href: '/about'     },
  { label: 'Contact',   href: '/contact'   },
  { label: 'Insights',  href: '/insights'  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden,   setHidden]   = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const prevScrollY = useRef(0);

  const { user } = useAuth();
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useEffect(() => { setMounted(true); }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 30);
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
          background:           scrolled ? 'rgba(6,5,15,0.92)' : 'transparent',
          backdropFilter:       scrolled ? 'blur(32px) saturate(1.8)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(32px) saturate(1.8)' : 'none',
          borderBottom:         scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        {/* Top glow when scrolled */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.4) 30%, rgba(168,85,247,0.6) 50%, rgba(59,130,246,0.4) 70%, transparent 100%)' }}
            />
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-6 lg:px-10" style={{ paddingTop: 'max(env(safe-area-inset-top),0px)' }}>
          <div className="flex items-center justify-between h-[64px]">

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Logo3D size="md" />
            </Link>

            {/* Desktop nav — uppercase, spaced */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative transition-colors duration-200"
                    style={{
                      fontSize:      '11px',
                      fontWeight:    600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color:         active ? '#fff' : 'rgba(148,163,184,0.7)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = active ? '#fff' : 'rgba(148,163,184,0.7)')}
                  >
                    {link.label}
                    {active && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-px"
                        style={{ background: 'rgba(124,58,237,0.7)' }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right CTA */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {mounted && user ? (
                <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}>
                  {/* Desktop */}
                  <div
                    className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-lg text-white transition-all duration-200 cursor-pointer"
                    style={{
                      fontSize:      '11px',
                      fontWeight:    700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      border:        '1px solid rgba(255,255,255,0.2)',
                      background:    'rgba(255,255,255,0.05)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  >
                    Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  {/* Mobile */}
                  <div className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow:'0 4px 14px rgba(124,58,237,0.35)' }}>
                    Dashboard
                  </div>
                </Link>
              ) : (
                <>
                  {/* Desktop: BOOK A CALL */}
                  <Link href="/request" className="hidden lg:flex items-center gap-2 transition-all duration-200"
                    style={{
                      padding:       '10px 22px',
                      fontSize:      '11px',
                      fontWeight:    700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color:         '#fff',
                      border:        '1px solid rgba(255,255,255,0.25)',
                      borderRadius:  '8px',
                      background:    'rgba(255,255,255,0.04)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(124,58,237,0.15)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(124,58,237,0.5)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.25)'; }}
                  >
                    Start New Project <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* Mobile */}
                  <Link href="/login" className="lg:hidden px-3.5 py-2 rounded-full text-sm font-medium text-slate-300 border border-white/10 active:scale-95 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    Sign In
                  </Link>
                  <Link href="/request" className="lg:hidden flex items-center px-3.5 py-2 rounded-full text-sm font-semibold text-white active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow:'0 4px 14px rgba(124,58,237,0.3)' }}>
                    Start →
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </motion.nav>
    </>
  );
}
