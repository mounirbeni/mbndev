'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, MessageSquare,
  CreditCard, Settings, Users, BarChart2, ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptic } from '@/hooks/useHaptic';
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
  const haptic         = useHaptic();
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
        position:             'fixed',
        bottom:               0,
        left:                 0,
        right:                0,
        zIndex:               9990,
        background:           'rgba(7, 7, 10, 0.97)',
        backdropFilter:       'blur(32px) saturate(1.9)',
        WebkitBackdropFilter: 'blur(32px) saturate(1.9)',
        borderTop:            '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="flex items-stretch justify-around"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
          paddingLeft:   'max(env(safe-area-inset-left, 0px), 0px)',
          paddingRight:  'max(env(safe-area-inset-right, 0px), 0px)',
        }}
      >
        {tabsDef.map((tab) => {
          const active = isActive(tab.href);
          const Icon   = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => haptic('selection')}
              className="relative flex flex-col items-center justify-center gap-[3px] flex-1 py-2.5 min-h-[58px] group select-none"
              aria-current={active ? 'page' : undefined}
            >
              {/* Active pill background */}
              {active && (
                <motion.div
                  layoutId="bottomNavPill"
                  className="absolute inset-x-1.5 top-1.5 h-[36px] rounded-[14px]"
                  style={{
                    background: 'rgba(124,58,237,0.18)',
                    border:     '1px solid rgba(124,58,237,0.28)',
                  }}
                  transition={{ type: 'spring', damping: 28, stiffness: 380, mass: 0.7 }}
                />
              )}

              {/* Icon + notification dot */}
              <div className="relative z-10 flex items-center justify-center w-[26px] h-[26px]">
                <motion.div
                  animate={active ? { scale: 1.08 } : { scale: 1 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 400 }}
                >
                  <Icon
                    className={cn(
                      'transition-colors duration-200',
                      active
                        ? 'text-primary-400 w-[22px] h-[22px]'
                        : 'text-slate-500 group-active:text-slate-300 w-[21px] h-[21px]'
                    )}
                    style={
                      active
                        ? { filter: 'drop-shadow(0 0 5px rgba(168,85,247,0.55))' }
                        : undefined
                    }
                    strokeWidth={active ? 2.2 : 1.75}
                  />
                </motion.div>

                {/* Notification dot — pulsing ring when active */}
                {tab.dot && (
                  <span className="absolute -top-0.5 -right-1 flex">
                    <span className="absolute inline-flex h-2 w-2 rounded-full bg-primary-500 opacity-75 animate-ping" />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"
                      style={{ border: '1.5px solid rgba(7,7,10,1)' }}
                    />
                  </span>
                )}
              </div>

              {/* Label */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={active ? 'active' : 'inactive'}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'relative z-10 text-[9.5px] font-medium leading-none tracking-wide transition-colors duration-200',
                    active
                      ? 'text-primary-400'
                      : 'text-slate-600 group-active:text-slate-400'
                  )}
                >
                  {t(tab.labelKey)}
                </motion.span>
              </AnimatePresence>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  if (!mounted) return null;
  return createPortal(nav, document.body);
}
