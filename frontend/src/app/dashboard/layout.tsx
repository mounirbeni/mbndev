'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar, { MobileSidebar } from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/mobile/BottomNav';
import NotificationBell from '@/components/dashboard/NotificationBell';
import FloatingSupport from '@/components/ui/FloatingSupport';
import Logo3D from '@/components/ui/Logo3D';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { useHaptic } from '@/hooks/useHaptic';

/* ─────────────────────────────────────────────────────────────────────────────
   Swipe-to-open sidebar gesture (left edge → right swipe ≥ 60px)
───────────────────────────────────────────────────────────────────────────── */
function useSwipeToOpenSidebar(onOpen: () => void) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartX.current = t.clientX;
      touchStartY.current = t.clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
      /* Only fire if: started within 20px of left edge, swiped right ≥ 60px,
         and more horizontal than vertical (not a vertical scroll) */
      if (touchStartX.current <= 20 && dx >= 60 && dy < 80) {
        onOpen();
      }
      touchStartX.current = null;
      touchStartY.current = null;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend',   onTouchEnd);
    };
  }, [onOpen]);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Scroll-hide header hook — hides header on scroll down, shows on scroll up
───────────────────────────────────────────────────────────────────────────── */
function useScrollHideHeader() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const scrollEl    = useRef<HTMLElement | null>(null);

  const onScroll = () => {
    const el = scrollEl.current;
    if (!el) return;
    const y = el.scrollTop;
    if (y < 10) { setHidden(false); lastScrollY.current = y; return; }
    setHidden(y > lastScrollY.current + 4);
    lastScrollY.current = y;
  };

  return { hidden, scrollRef: scrollEl, onScroll };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const haptic = useHaptic();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hidden, scrollRef, onScroll } = useScrollHideHeader();

  /* Redirect unauthenticated users */
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  /* Swipe-from-left-edge opens sidebar on mobile */
  useSwipeToOpenSidebar(() => {
    if (window.innerWidth >= 1024) return; // desktop only uses permanent sidebar
    haptic('light');
    setSidebarOpen(true);
  });

  /* ── Loading / unauthenticated skeleton ──────────────────────────────── */
  if (loading || !user) {
    return (
      <div className="min-h-dvh flex flex-col" style={{ background: '#0a0a0d' }}>
        <div
          className="lg:hidden shrink-0 px-4 flex items-center justify-between"
          style={{
            paddingTop:   'max(env(safe-area-inset-top, 0px), 0px)',
            height:       'calc(56px + max(env(safe-area-inset-top, 0px), 0px))',
            background:   'rgba(10,10,13,0.97)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 skeleton-shimmer" />
          <div className="w-20 h-4 rounded-lg bg-white/5 skeleton-shimmer" />
          <div className="w-10 h-10 rounded-xl bg-white/5 skeleton-shimmer" />
        </div>
        <div className="flex-1 p-4 lg:p-6">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  /* ── Authenticated layout ─────────────────────────────────────────────── */
  return (
    <div
      className="flex overflow-hidden"
      style={{ height: '100dvh', background: '#0a0a0d' }}
    >
      {/* ── Desktop permanent sidebar (hidden on mobile) ─────────────── */}
      <div className="hidden lg:flex flex-col shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile sidebar — controlled externally via state ─────────── */}
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* ── Content column ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Mobile top bar ─────────────────────────────────────────── */}
        {/* IMPORTANT: No backdrop-filter here — creates a stacking context
            that would trap fixed children (MobileSidebar, BottomNav).    */}
        <motion.header
          animate={{ y: hidden ? '-100%' : '0%' }}
          transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
          className="lg:hidden shrink-0 px-4 flex items-center justify-between relative"
          style={{
            paddingTop:   'max(env(safe-area-inset-top, 0px), 0px)',
            height:       'calc(56px + max(env(safe-area-inset-top, 0px), 0px))',
            background:   'rgba(10, 10, 13, 0.99)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            zIndex:       100,
          }}
        >
          {/* Left: hamburger — wired to state instead of its own toggle */}
          <button
            onClick={() => { haptic('light'); setSidebarOpen(true); }}
            aria-label="Open menu"
            className="w-10 h-10 flex items-center justify-center rounded-xl
                       text-slate-400 active:text-white active:bg-white/8
                       transition-colors touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
            </svg>
          </button>

          {/* Center: brand */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
          >
            <Logo3D size="sm" />
            <span className="text-white font-bold text-sm tracking-wide select-none">
              MBN DEV
            </span>
          </Link>

          {/* Right: notification bell + avatar */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-white font-bold text-xs shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }}
            >
              {getInitials(user.name)}
            </div>
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
          {/* Left: breadcrumb placeholder (pages can portal content here later) */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <span className="text-slate-500 text-xs font-medium">Dashboard</span>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* Divider */}
            <div className="w-px h-6 bg-white/8" />

            {/* Avatar + name */}
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
          ref={scrollRef as React.RefObject<HTMLDivElement>}
          className="flex-1 overflow-y-auto p-4 lg:p-6 inertial-scroll"
          onScroll={onScroll}
          style={{
            /* Bottom padding: BottomNav (58px) + safe-area + gap */
            paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 8px) + 74px)',
          }}
        >
          {children}
        </main>
      </div>

      {/* BottomNav — portalled to body */}
      <BottomNav />

      {/* Floating support button */}
      <FloatingSupport />
    </div>
  );
}
