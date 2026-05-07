'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  ShoppingBag,
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
  { label: 'Dashboard', href: '/dashboard/admin',           icon: LayoutDashboard },
  { label: 'Orders',    href: '/dashboard/admin/orders',    icon: ShoppingBag },
  { label: 'Projects',  href: '/dashboard/admin/projects',  icon: FolderOpen },
  { label: 'Messages',  href: '/dashboard/admin/messages',  icon: MessageSquare },
  { label: 'Clients',   href: '/dashboard/admin/clients',   icon: Users },
  { label: 'Packages',  href: '/dashboard/admin/packages',  icon: Package },
  { label: 'Payments',  href: '/dashboard/admin/payments',  icon: CreditCard },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart2 },
];

const clientNav: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard/client',           icon: LayoutDashboard },
  { label: 'My Orders',   href: '/dashboard/client/orders',    icon: ShoppingBag },
  { label: 'My Projects', href: '/dashboard/client/projects',  icon: FolderOpen },
  { label: 'Messages',    href: '/dashboard/client/messages',  icon: MessageSquare },
  { label: 'Payments',    href: '/dashboard/client/payments',  icon: CreditCard },
  { label: 'Settings',    href: '/dashboard/client/settings',  icon: Settings },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Sidebar panel — shared between desktop permanent sidebar and mobile drawer
───────────────────────────────────────────────────────────────────────────── */
interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();
  const nav      = isAdmin ? adminNav : clientNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/');
    onClose?.();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div
      className={cn(
        'flex flex-col h-full select-none',
        mobile
          ? 'w-[280px] sm:w-72'          // mobile drawer width
          : 'w-64 border-r border-white/6' // desktop sidebar
      )}
      style={{
        background: 'rgba(10, 10, 13, 0.97)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div
        className="px-4 flex items-center justify-between border-b border-white/8 shrink-0"
        style={{
          paddingTop:    mobile ? 'max(env(safe-area-inset-top, 0px) + 12px, 16px)' : '18px',
          paddingBottom: '16px',
        }}
      >
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shrink-0"
               style={{ boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-[15px]">MBN DEV</span>
        </Link>

        {mobile && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400
                       hover:text-white hover:bg-white/8 active:bg-white/12 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── User card ─────────────────────────────────────────────────── */}
      <div className="px-3 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl"
             style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl
                          flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-sm font-semibold leading-tight truncate">{user?.name}</div>
            <div className="text-slate-500 text-xs capitalize mt-0.5">{user?.role} account</div>
          </div>
        </div>
      </div>

      {/* ── Nav items ─────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-2 space-y-0.5"
           style={{ WebkitOverflowScrolling: 'touch' }}>
        {nav.map((item) => {
          const active = isActive(item.href);
          const Icon   = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-150 group',
                active
                  ? 'text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              )}
              style={active ? {
                background: 'rgba(124,58,237,0.15)',
                border:     '1px solid rgba(124,58,237,0.25)',
              } : {
                border: '1px solid transparent',
              }}
            >
              {/* Icon container */}
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                active ? '' : 'group-hover:bg-white/6'
              )}
              style={active ? { background: 'rgba(124,58,237,0.2)' } : {}}>
                <Icon className={cn('w-4 h-4', active ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300')} />
              </div>

              <span className="flex-1 leading-none">{item.label}</span>

              {active
                ? <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                : <ChevronRight className="w-3.5 h-3.5 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              }
            </Link>
          );
        })}
      </nav>

      {/* ── Sign out ──────────────────────────────────────────────────── */}
      <div
        className="px-3 pt-2 border-t border-white/8 shrink-0"
        style={{ paddingBottom: mobile ? 'max(env(safe-area-inset-bottom, 0px) + 12px, 20px)' : '16px' }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm
                     text-slate-400 hover:text-red-400 transition-all group"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)', e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = '', e.currentTarget.style.borderColor = 'transparent')}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MobileSidebar — hamburger trigger + full-screen drawer via React portal.

   WHY PORTAL?
   The dashboard <header> uses `backdrop-filter` which creates a CSS stacking
   context. Any `position:fixed` child of that header has its z-index resolved
   WITHIN that stacking context, not globally — so the drawer ends up painted
   behind the <main> content. createPortal() attaches the overlay directly to
   <body>, completely escaping every stacking context.
───────────────────────────────────────────────────────────────────────────── */
export function MobileSidebar() {
  const [open,    setOpen]    = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render portal on client (createPortal needs document)
  useEffect(() => { setMounted(true); }, []);

  // Lock / unlock body scroll when drawer is open
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open, mounted]);

  const handleClose = () => setOpen(false);

  // The overlay rendered via portal — completely outside any stacking context
  const portalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Dark blur backdrop ────────────────────────────────────── */}
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={handleClose}
            style={{
              position:        'fixed',
              inset:           0,
              zIndex:          9998,
              background:      'rgba(0, 0, 0, 0.75)',
              backdropFilter:  'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* ── Slide-in drawer ───────────────────────────────────────── */}
          <motion.div
            key="sidebar-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
            style={{
              position: 'fixed',
              top:      0,
              left:     0,
              bottom:   0,
              zIndex:   9999,
              boxShadow: '4px 0 40px rgba(0,0,0,0.6), 2px 0 16px rgba(0,0,0,0.4)',
            }}
          >
            <Sidebar mobile onClose={handleClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Hamburger trigger button — stays inside header */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl
                   text-slate-400 hover:text-white hover:bg-white/8
                   active:bg-white/12 active:scale-95 transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Portal overlay — rendered directly in document.body */}
      {mounted && createPortal(portalContent, document.body)}
    </>
  );
}
