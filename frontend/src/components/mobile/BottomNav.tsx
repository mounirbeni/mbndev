'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  CreditCard,
  Settings,
  Users,
  Package,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavTab {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminTabs: NavTab[] = [
  { label: 'Home',     href: '/dashboard/admin',           icon: LayoutDashboard },
  { label: 'Projects', href: '/dashboard/admin/projects',  icon: FolderOpen },
  { label: 'Messages', href: '/dashboard/admin/messages',  icon: MessageSquare },
  { label: 'Clients',  href: '/dashboard/admin/clients',   icon: Users },
  { label: 'More',     href: '/dashboard/admin/analytics', icon: BarChart2 },
];

const clientTabs: NavTab[] = [
  { label: 'Home',     href: '/dashboard/client',           icon: LayoutDashboard },
  { label: 'Projects', href: '/dashboard/client/projects',  icon: FolderOpen },
  { label: 'Messages', href: '/dashboard/client/messages',  icon: MessageSquare },
  { label: 'Payments', href: '/dashboard/client/payments',  icon: CreditCard },
  { label: 'Settings', href: '/dashboard/client/settings',  icon: Settings },
];

export default function BottomNav() {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const tabs = isAdmin ? adminTabs : clientTabs;

  const isActive = (href: string) => {
    // Exact match for dashboard home, startsWith for sections
    const dashHome = isAdmin ? '/dashboard/admin' : '/dashboard/client';
    if (href === dashHome) return pathname === dashHome;
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-dark-300/90 backdrop-blur-xl border-t border-white/10" />

      <div className="relative flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px] relative"
            >
              {/* Active pill background */}
              {active && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute inset-0 bg-primary-500/15 rounded-xl"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    active ? 'text-primary-400' : 'text-slate-500'
                  )}
                />
                {/* Active dot */}
                {active && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary-400 rounded-full"
                  />
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-200 leading-none',
                  active ? 'text-primary-400' : 'text-slate-600'
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
