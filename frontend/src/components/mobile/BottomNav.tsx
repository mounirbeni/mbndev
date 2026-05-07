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
  { label: 'Stats',    href: '/dashboard/admin/analytics', icon: BarChart2 },
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
    const dashHome = isAdmin ? '/dashboard/admin' : '/dashboard/client';
    if (href === dashHome) return pathname === dashHome;
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bottom-nav-glass"
      aria-label="Mobile navigation"
    >
      <div
        className="flex items-end justify-around px-1"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-end pt-2 pb-1.5 flex-1 min-h-[56px] group"
              aria-current={active ? 'page' : undefined}
            >
              {/* Active pill */}
              {active && (
                <motion.div
                  layoutId="bottomNavPill"
                  className="absolute top-1.5 left-1 right-1 h-[34px] bg-primary-500/18 rounded-xl border border-primary-500/25"
                  transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                />
              )}

              {/* Icon container */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-[22px] h-[22px] transition-all duration-200',
                      active
                        ? 'text-primary-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                        : 'text-slate-500 group-active:text-slate-300'
                    )}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  {/* Notification dot (can be made dynamic later) */}
                  {tab.label === 'Messages' && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-primary-500 rounded-full border-2 border-[#08080b]" />
                  )}
                </div>

                <span
                  className={cn(
                    'text-[10px] font-medium leading-none transition-all duration-200',
                    active ? 'text-primary-400' : 'text-slate-600 group-active:text-slate-400'
                  )}
                >
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
