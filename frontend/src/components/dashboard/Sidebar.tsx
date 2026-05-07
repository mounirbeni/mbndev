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
  Bell,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Projects', href: '/dashboard/admin/projects', icon: FolderOpen },
  { label: 'Messages', href: '/dashboard/admin/messages', icon: MessageSquare },
  { label: 'Clients', href: '/dashboard/admin/clients', icon: Users },
  { label: 'Packages', href: '/dashboard/admin/packages', icon: Package },
  { label: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart2 },
];

const clientNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/client', icon: LayoutDashboard },
  { label: 'My Projects', href: '/dashboard/client/projects', icon: FolderOpen },
  { label: 'Messages', href: '/dashboard/client/messages', icon: MessageSquare },
  { label: 'Payments', href: '/dashboard/client/payments', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/client/settings', icon: Settings },
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
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold">MBN DEV</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 mx-3 mt-3 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.name}</div>
            <div className="text-slate-500 text-xs capitalize">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                active
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-64 h-full glass border-r border-white/5 flex flex-col">
      {content}
    </div>
  );
}

// Mobile sidebar wrapper
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 text-slate-400 hover:text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              <Sidebar mobile onClose={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
