'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Zap,
  Users,
  Package,
  Menu,
  X,
  BarChart2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin',           icon: LayoutDashboard },
  { label: 'Projects',  href: '/dashboard/admin/projects',  icon: FolderOpen },
  { label: 'Messages',  href: '/dashboard/admin/messages',  icon: MessageSquare },
  { label: 'Clients',   href: '/dashboard/admin/clients',   icon: Users },
  { label: 'Packages',  href: '/dashboard/admin/packages',  icon: Package },
  { label: 'Payments',  href: '/dashboard/admin/payments',  icon: CreditCard },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart2 },
];

const clientNav: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard/client',           icon: LayoutDashboard },
  { label: 'My Projects', href: '/dashboard/client/projects',  icon: FolderOpen },
  { label: 'Messages',    href: '/dashboard/client/messages',  icon: MessageSquare },
  { label: 'Payments',    href: '/dashboard/client/payments',  icon: CreditCard },
  { label: 'Settings',    href: '/dashboard/client/settings',  icon: Settings },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const nav = isAdmin ? adminNav : clientNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
    onClose?.();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className={cn(
      'flex flex-col h-full',
      mobile ? 'glass-panel w-72' : 'w-64 glass border-r border-white/6'
    )}>
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div
        className="px-5 flex items-center justify-between border-b border-white/6"
        style={{
          paddingTop: mobile ? 'max(env(safe-area-inset-top), 16px)' : '20px',
          paddingBottom: '16px',
        }}
      >
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center glow-purple">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold">MBN DEV</span>
        </Link>
        {mobile && (
          <button
            onClick={onClose}
            className="touch-target rounded-xl text-slate-400 hover:text-white active:bg-white/5 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── User card ─────────────────────────────────────────────────── */}
      <div className="px-3 pt-4 pb-1">
        <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-2xl border border-white/6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-slate-500 text-xs capitalize mt-0.5">{user?.role} account</div>
          </div>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scroll-native px-3 pt-3 pb-2 space-y-0.5">
        {nav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group',
                active
                  ? 'bg-primary-500/18 text-white border border-primary-500/28 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                active ? 'bg-primary-500/20' : 'bg-transparent group-hover:bg-white/5'
              )}>
                <Icon className={cn(
                  'w-4 h-4 transition-colors',
                  active ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'
                )} />
              </div>
              <span className="flex-1">{item.label}</span>
              {active ? (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom actions ────────────────────────────────────────────── */}
      <div
        className="px-3 pt-2 pb-4 border-t border-white/6"
        style={{ paddingBottom: mobile ? 'max(env(safe-area-inset-bottom), 16px)' : '16px' }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/15 transition-all"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ── Mobile sidebar slide-in drawer ──────────────────────────────────────── */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden touch-target rounded-xl text-slate-400 hover:text-white active:bg-white/5 transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden shadow-2xl shadow-black/60"
            >
              <Sidebar mobile onClose={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
