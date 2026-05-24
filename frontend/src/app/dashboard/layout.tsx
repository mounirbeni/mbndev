'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import MobileNav from '@/components/mobile/MobileNav';
import NotificationBell from '@/components/dashboard/NotificationBell';
import FloatingSupport from '@/components/ui/FloatingSupport';
import WhatsNewModal from '@/components/ui/WhatsNewModal';
import Logo3D from '@/components/ui/Logo3D';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────────
   Scroll-hide header hook — hides mobile header on scroll-down, shows on up
───────────────────────────────────────────────────────────────────────────── */
function useScrollHideHeader() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const scrollEl    = useRef<HTMLDivElement | null>(null);

  const onScroll = () => {
    const el = scrollEl.current;
    if (!el) return;
    const y = el.scrollTop;
    if (y < 10) { setHidden(false); lastScrollY.current = y; return; }
    setHidden(y > lastScrollY.current + 4);
    lastScrollY.current = y;
  };

  return { hidden, scrollRef: scrollEl as React.RefObject<HTMLDivElement>, onScroll };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router            = useRouter();
  const pathname          = usePathname();
  const { hidden, scrollRef, onScroll } = useScrollHideHeader();

  /* Redirect unauthenticated users */
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  /* ── Loading / unauthenticated skeleton ─────────────────────────────── */
  if (loading || !user) {
    return (
      <div className="min-h-dvh flex flex-col" style={{ background: '#08080b' }}>
        {/* Skeleton mobile header */}
        <div
          className="lg:hidden shrink-0 px-4 flex items-center justify-between"
          style={{
            paddingTop:   'max(env(safe-area-inset-top, 0px), 0px)',
            height:       'calc(52px + max(env(safe-area-inset-top, 0px), 0px))',
            background:   'rgba(8,8,11,0.98)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="w-24 h-5 rounded-lg skeleton-shimmer" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
            <div className="w-9 h-9 rounded-xl skeleton-shimmer" />
          </div>
        </div>
        <div className="flex-1 p-4 lg:p-6">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  /* ── Authenticated layout ────────────────────────────────────────────── */
  return (
    /*
     * layout-frame: receives the iOS-style push-back transform when the
     * NavSheet opens (class applied by MobileNav via body.nav-sheet-open).
     * overflow:hidden is required for border-radius clipping on scale.
     */
    <div
      className="flex overflow-hidden layout-frame"
      style={{ height: '100dvh', background: '#08080b' }}
    >
      {/* ── Desktop permanent sidebar ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-col shrink-0">
        <Sidebar />
      </div>

      {/* ── Content column ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Mobile top bar ─────────────────────────────────────────── */}
        {/*
         * IMPORTANT: No backdrop-filter here — creates a stacking context
         * that would trap fixed children (NavSheet, BottomBar).
         */}
        <motion.header
          animate={{ y: hidden ? '-100%' : '0%' }}
          transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
          className="lg:hidden shrink-0 flex items-center justify-between px-4 relative"
          style={{
            paddingTop:   'max(env(safe-area-inset-top, 0px), 0px)',
            height:       'calc(52px + max(env(safe-area-inset-top, 0px), 0px))',
            background:   'rgba(8, 8, 11, 0.99)',
            borderBottom: '1px solid rgba(255,255,255,0.065)',
            zIndex:       100,
          }}
        >
          {/* Left: Logo + Brand */}
          <Link href="/" className="flex items-center select-none">
            <Logo3D variant="full" size="sm" />
          </Link>

          {/* Right: Notification bell + Avatar (avatar tap → open NavSheet) */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('open-nav-sheet'))}
              aria-label="Open navigation"
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-white font-bold text-xs shrink-0 select-none
                         active:opacity-75 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }}
            >
              {getInitials(user.name)}
            </button>
          </div>
        </motion.header>

        {/* ── Desktop top bar ──────────────────────────────────────── */}
        <header
          className="hidden lg:flex shrink-0 items-center justify-between px-6 py-3.5"
          style={{
            background:   'rgba(8, 8, 11, 0.98)',
            borderBottom: '1px solid rgba(255,255,255,0.065)',
          }}
        >
          {/* Left: breadcrumb indicator */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <span className="text-slate-500 text-xs font-medium">Dashboard</span>
          </div>

          {/* Right: notification bell + divider + avatar */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-px h-6 bg-white/8" />
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <div className="text-white text-sm font-semibold leading-tight">{user.name}</div>
                <div className="text-slate-500 text-[11px] capitalize mt-0.5">{user.role}</div>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center
                           text-white font-bold text-xs shrink-0 cursor-default
                           ring-2 ring-primary-500/20"
                style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
              >
                {getInitials(user.name)}
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────── */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto inertial-scroll"
          onScroll={onScroll}
          style={{
            paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 8px) + 74px)',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="p-4 lg:p-6 min-h-full"
            >
              <ErrorBoundary scope="Dashboard" resetLabel="Reload section">
                {children}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile navigation (BottomBar + NavSheet) ─────────────── */}
      <MobileNav />

      {/* ── Floating support button ──────────────────────────────── */}
      <FloatingSupport />

      {/* ── What's New popup (once per version) ──────────────────── */}
      <WhatsNewModal />
    </div>
  );
}
