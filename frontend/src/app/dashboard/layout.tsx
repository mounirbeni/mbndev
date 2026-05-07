'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar, { MobileSidebar } from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/mobile/BottomNav';
import { Bell, Zap } from 'lucide-react';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  /* ── Loading / unauthenticated skeleton ──────────────────────────────── */
  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0d' }}>
        {/* Mobile skeleton top bar */}
        <div
          className="lg:hidden shrink-0 px-4 flex items-center justify-between"
          style={{
            paddingTop:    'max(env(safe-area-inset-top, 0px), 0px)',
            height:        'calc(56px + max(env(safe-area-inset-top, 0px), 0px))',
            background:    'rgba(10,10,13,0.97)',
            borderBottom:  '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
          <div className="w-20 h-4 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
        </div>
        <div className="flex-1 p-4 lg:p-6">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  /* ── Authenticated layout ─────────────────────────────────────────────── */
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0d' }}>

      {/* ── Desktop permanent sidebar (hidden on mobile) ─────────────── */}
      <div className="hidden lg:flex flex-col shrink-0">
        <Sidebar />
      </div>

      {/* ── Content column ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar
            IMPORTANT: No backdrop-filter here — it would create a stacking
            context that traps fixed children (MobileSidebar drawer, BottomNav).
            We use a solid near-opaque background instead.                     */}
        <header
          className="lg:hidden shrink-0 px-4 flex items-center justify-between relative"
          style={{
            paddingTop:   'max(env(safe-area-inset-top, 0px), 0px)',
            height:       'calc(56px + max(env(safe-area-inset-top, 0px), 0px))',
            background:   'rgba(10, 10, 13, 0.98)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            // NO backdrop-filter — avoids creating stacking context
          }}
        >
          {/* Left: hamburger */}
          <MobileSidebar />

          {/* Center: brand (absolutely centred so it doesn't shift) */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#7c3aed' }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-wide select-none">
              MBN DEV
            </span>
          </Link>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl
                         text-slate-400 hover:text-white active:bg-white/10 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Bell className="w-4 h-4" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500"
                style={{ boxShadow: '0 0 0 2px #0a0a0d' }}
              />
            </button>

            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-white font-bold text-xs shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }}
            >
              {getInitials(user.name)}
            </div>
          </div>
        </header>

        {/* Desktop top bar */}
        <header
          className="hidden lg:flex shrink-0 items-center justify-between px-6 py-3"
          style={{
            background:   'rgba(10, 10, 13, 0.97)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div />
          <div className="flex items-center gap-3">
            <button
              className="relative w-9 h-9 flex items-center justify-center rounded-xl
                         text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Bell className="w-4 h-4" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500"
                style={{ boxShadow: '0 0 0 2px #0a0a0d' }}
              />
            </button>
            <div className="text-right">
              <div className="text-white text-sm font-medium">{user.name}</div>
              <div className="text-slate-500 text-xs capitalize">{user.role}</div>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-white font-bold text-xs shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }}
            >
              {getInitials(user.name)}
            </div>
          </div>
        </header>

        {/* Page content
            Bottom padding on mobile = BottomNav height (56px) + safe-area + gap */}
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior:      'contain',
            paddingBottom:           'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          }}
        >
          {children}
        </main>
      </div>

      {/* BottomNav — portalled to body inside its own component */}
      <BottomNav />
    </div>
  );
}
