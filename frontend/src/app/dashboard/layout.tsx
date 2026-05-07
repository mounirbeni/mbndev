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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-dark-300 flex flex-col">
        {/* Mobile skeleton header */}
        <div
          className="glass-strong border-b border-white/6 px-4 flex items-center justify-between lg:hidden"
          style={{
            paddingTop: 'max(env(safe-area-inset-top), 0px)',
            height: 'calc(56px + max(env(safe-area-inset-top), 0px))',
          }}
        >
          <div className="w-8 h-8 bg-white/5 rounded-xl animate-pulse" />
          <div className="w-20 h-4 bg-white/5 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="flex-1 p-4 lg:p-6">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-300 overflow-hidden">
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden lg:flex flex-col">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Mobile top bar ─────────────────────────────────────────────── */}
        <header
          className="glass-strong border-b border-white/6 shrink-0 lg:hidden"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
        >
          <div className="flex items-center justify-between px-4 h-14">
            {/* Left: hamburger (full sidebar on demand) */}
            <MobileSidebar />

            {/* Center: Brand */}
            <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white font-bold text-sm tracking-wide">MBN DEV</span>
            </Link>

            {/* Right: notifications + avatar */}
            <div className="flex items-center gap-2">
              <button
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white active:bg-white/10 transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-[#0a0a0d]" />
              </button>

              {/* User avatar */}
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0">
                {getInitials(user.name)}
              </div>
            </div>
          </div>
        </header>

        {/* ── Desktop top bar ────────────────────────────────────────────── */}
        <header className="glass-strong border-b border-white/6 px-6 py-3 hidden lg:flex items-center justify-between shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-[#0a0a0d]" />
            </button>
            <div className="text-right">
              <div className="text-white text-sm font-medium">{user.name}</div>
              <div className="text-slate-500 text-xs capitalize">{user.role}</div>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0">
              {getInitials(user.name)}
            </div>
          </div>
        </header>

        {/* ── Page content ──────────────────────────────────────────────── */}
        <main
          className="flex-1 overflow-y-auto scroll-native p-4 lg:p-6"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
