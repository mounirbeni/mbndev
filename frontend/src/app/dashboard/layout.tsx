'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar, { MobileSidebar } from '@/components/dashboard/Sidebar';
import BottomNav from '@/components/mobile/BottomNav';
import { Bell } from 'lucide-react';
import { SkeletonDashboard } from '@/components/ui/Skeleton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-dark-300 flex flex-col">
        {/* Mobile skeleton header */}
        <div className="glass border-b border-white/5 px-4 py-3.5 flex items-center justify-between lg:hidden">
          <div className="w-8 h-8 bg-white/5 rounded-xl animate-pulse" />
          <div className="w-24 h-5 bg-white/5 rounded-lg animate-pulse" />
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="glass border-b border-white/5 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger only on mobile — replaced by BottomNav tabs */}
            <MobileSidebar />
            {/* Logo text on mobile */}
            <div className="lg:hidden">
              <span className="text-white font-bold text-sm">MBN DEV</span>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
            </button>
            <div className="text-right hidden sm:block">
              <div className="text-white text-sm font-medium">{user.name}</div>
              <div className="text-slate-500 text-xs capitalize">{user.role}</div>
            </div>
          </div>
        </header>

        {/* Page content — adds bottom padding on mobile for BottomNav */}
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-native"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
