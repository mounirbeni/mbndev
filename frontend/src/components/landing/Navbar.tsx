'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Home',      href: '/' },
  { label: 'Services',  href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing',   href: '/pricing' },
  { label: 'About',     href: '/about' },
  { label: 'Contact',   href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center glow-purple group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">MBN DEV</div>
              <div className="text-slate-500 text-xs leading-none">by Mounir Banni</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}>
                <Button size="md">Go to Dashboard →</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="md">Sign In</Button>
                </Link>
                <Link href="/request">
                  <Button size="md">Start Your Project →</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden mt-4 pb-4 border-t border-white/10"
            >
              <div className="pt-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      isActive(link.href)
                        ? 'text-white bg-white/10'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-3 flex flex-col gap-2">
                  {user ? (
                    <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'} onClick={() => setMenuOpen(false)}>
                      <Button size="md" className="w-full">Go to Dashboard</Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMenuOpen(false)}>
                        <Button variant="outline" size="md" className="w-full">Sign In</Button>
                      </Link>
                      <Link href="/request" onClick={() => setMenuOpen(false)}>
                        <Button size="md" className="w-full">Start Your Project</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
