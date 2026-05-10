'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, MessageSquare,
  CreditCard, Settings, Users, BarChart2, ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface NavTab {
  labelKey: string;
  href:     string;
  icon:     React.ElementType;
  dot?:     boolean;
}

const adminTabsDef: NavTab[] = [
  { labelKey: 'dash.nav.home',     href: '/dashboard/admin',           icon: LayoutDashboard },
  { labelKey: 'dash.nav.orders',   href: '/dashboard/admin/orders',    icon: ShoppingBag },
  { labelKey: 'dash.nav.projects', href: '/dashboard/admin/projects',  icon: FolderOpen },
  { labelKey: 'dash.nav.messages', href: '/dashboard/admin/messages',  icon: MessageSquare, dot: true },
  { labelKey: 'dash.nav.stats',    href: '/dashboard/admin/analytics', icon: BarChart2 },
];

const clientTabsDef: NavTab[] = [
  { labelKey: 'dash.nav.home',     href: '/dashboard/client',           icon: LayoutDashboard },
  { labelKey: 'dash.nav.orders',   href: '/dashboard/client/orders',    icon: ShoppingBag },
  { labelKey: 'dash.nav.projects', href: '/dashboard/client/projects',  icon: FolderOpen },
  { labelKey: 'dash.nav.messages', href: '/dashboard/client/messages',  icon: MessageSquare, dot: true },
  { labelKey: 'dash.nav.settings', href: '/dashboard/client/settings',  icon: Settings },
];

export default function BottomNav() {
  const { isAdmin }    = useAuth();
  const { t }          = useLanguage();
  const pathname       = usePathname();
  const tabsDef        = isAdmin ? adminTabsDef : clientTabsDef;
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isActive = (href: string) => {
    const dashHome = isAdmin ? '/dashboard/admin' : '/dashboard/client';
    if (href === dashHome) return pathname === dashHome;
    return pathname.startsWith(href);
  };

  const nav = (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9990,
        background:           'rgba(8, 8, 11, 0.97)',
        backdropFilter:       'blur(28px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        className="flex items-stretch justify-around px-1"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        {tabsDef.map((tab) => {
          const active = isActive(tab.href);
          const Icon   = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-[56px] group"
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="bottomNavPill"
                  className="absolute inset-x-1 top-1.5 h-[34px] rounded-xl"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.22)' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                />
              )}

              <div className="relative z-10">
                <Icon
                  className={cn(
                    'w-[22px] h-[22px] transition-all duration-200',
                    active ? 'text-primary-400' : 'text-slate-500 group-active:text-slate-300'
                  )}
                  style={active ? { filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.5))' } : {}}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {tab.dot && (
                  <span
                    className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-primary-500"
                    style={{ border: '2px solid rgba(8,8,11,1)' }}
                  />
                )}
              </div>

              <span
                className={cn(
                  'relative z-10 text-[10px] font-medium leading-none transition-colors duration-200',
                  active ? 'text-primary-400' : 'text-slate-600 group-active:text-slate-400'
                )}
              >
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  if (!mounted) return null;
  return createPortal(nav, document.body);
}
