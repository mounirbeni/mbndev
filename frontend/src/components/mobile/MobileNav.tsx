'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  motion, AnimatePresence, useMotionValue, useTransform,
  useDragControls,
} from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, MessageSquare, CreditCard,
  Settings, LogOut, Users, Package, BarChart2, ShoppingBag,
  X, ExternalLink, LayoutGrid,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptic } from '@/hooks/useHaptic';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

/* ─── Types ────────────────────────────────────────────────────────────────── */
type NavItem = { labelKey: string; href: string; icon: React.ElementType; dot?: boolean };

/* ─── Route definitions ─────────────────────────────────────────────────────
   Bottom tabs: 4 primary items. 5th slot = "More" button (managed separately).
   Sheet items: ALL nav items (shown in full-screen grid).
───────────────────────────────────────────────────────────────────────────── */
const adminBottomDef: NavItem[] = [
  { labelKey: 'dash.nav.home',     href: '/dashboard/admin',           icon: LayoutDashboard },
  { labelKey: 'dash.nav.projects', href: '/dashboard/admin/projects',  icon: FolderOpen },
  { labelKey: 'dash.nav.messages', href: '/dashboard/admin/messages',  icon: MessageSquare, dot: true },
  { labelKey: 'dash.nav.stats',    href: '/dashboard/admin/analytics', icon: BarChart2 },
];

const clientBottomDef: NavItem[] = [
  { labelKey: 'dash.nav.home',     href: '/dashboard/client',           icon: LayoutDashboard },
  { labelKey: 'dash.nav.projects', href: '/dashboard/client/projects',  icon: FolderOpen },
  { labelKey: 'dash.nav.messages', href: '/dashboard/client/messages',  icon: MessageSquare, dot: true },
  { labelKey: 'dash.nav.payments', href: '/dashboard/client/payments',  icon: CreditCard },
];

const adminSheetDef: NavItem[] = [
  { labelKey: 'dash.nav.dashboard', href: '/dashboard/admin',           icon: LayoutDashboard },
  { labelKey: 'dash.nav.orders',    href: '/dashboard/admin/orders',    icon: ShoppingBag },
  { labelKey: 'dash.nav.projects',  href: '/dashboard/admin/projects',  icon: FolderOpen },
  { labelKey: 'dash.nav.messages',  href: '/dashboard/admin/messages',  icon: MessageSquare },
  { labelKey: 'dash.nav.clients',   href: '/dashboard/admin/clients',   icon: Users },
  { labelKey: 'dash.nav.packages',  href: '/dashboard/admin/packages',  icon: Package },
  { labelKey: 'dash.nav.payments',  href: '/dashboard/admin/payments',  icon: CreditCard },
  { labelKey: 'dash.nav.analytics', href: '/dashboard/admin/analytics', icon: BarChart2 },
];

const clientSheetDef: NavItem[] = [
  { labelKey: 'dash.nav.dashboard',  href: '/dashboard/client',           icon: LayoutDashboard },
  { labelKey: 'dash.nav.myOrders',   href: '/dashboard/client/orders',    icon: ShoppingBag },
  { labelKey: 'dash.nav.myProjects', href: '/dashboard/client/projects',  icon: FolderOpen },
  { labelKey: 'dash.nav.messages',   href: '/dashboard/client/messages',  icon: MessageSquare },
  { labelKey: 'dash.nav.payments',   href: '/dashboard/client/payments',  icon: CreditCard },
  { labelKey: 'dash.nav.settings',   href: '/dashboard/client/settings',  icon: Settings },
];

/* ─── Icon → visual scheme ──────────────────────────────────────────────────
   Each icon gets a unique color identity used in the sheet grid cells.
───────────────────────────────────────────────────────────────────────────── */
type Scheme = { bg: string; text: string; glow: string; border: string; dot: string };

const schemeMap = new Map<React.ElementType, Scheme>([
  [LayoutDashboard, { bg:'rgba(124,58,237,0.16)', text:'#a78bfa', glow:'rgba(124,58,237,0.3)',  border:'rgba(124,58,237,0.28)', dot:'#7c3aed' }],
  [ShoppingBag,     { bg:'rgba(59,130,246,0.16)',  text:'#60a5fa', glow:'rgba(59,130,246,0.3)',  border:'rgba(59,130,246,0.28)', dot:'#3b82f6' }],
  [FolderOpen,      { bg:'rgba(245,158,11,0.16)',  text:'#fbbf24', glow:'rgba(245,158,11,0.3)',  border:'rgba(245,158,11,0.28)', dot:'#f59e0b' }],
  [MessageSquare,   { bg:'rgba(16,185,129,0.16)',  text:'#34d399', glow:'rgba(16,185,129,0.3)',  border:'rgba(16,185,129,0.28)', dot:'#10b981' }],
  [CreditCard,      { bg:'rgba(20,184,166,0.16)',  text:'#2dd4bf', glow:'rgba(20,184,166,0.3)',  border:'rgba(20,184,166,0.28)', dot:'#14b8a6' }],
  [Settings,        { bg:'rgba(148,163,184,0.12)', text:'#94a3b8', glow:'rgba(148,163,184,0.2)', border:'rgba(148,163,184,0.18)',dot:'#64748b' }],
  [Users,           { bg:'rgba(236,72,153,0.16)',  text:'#f472b6', glow:'rgba(236,72,153,0.3)',  border:'rgba(236,72,153,0.28)', dot:'#ec4899' }],
  [Package,         { bg:'rgba(251,146,60,0.16)',  text:'#fb923c', glow:'rgba(251,146,60,0.3)',  border:'rgba(251,146,60,0.28)', dot:'#f97316' }],
  [BarChart2,       { bg:'rgba(99,102,241,0.16)',  text:'#818cf8', glow:'rgba(99,102,241,0.3)',  border:'rgba(99,102,241,0.28)', dot:'#6366f1' }],
]);
const defaultScheme: Scheme = { bg:'rgba(124,58,237,0.16)', text:'#a78bfa', glow:'rgba(124,58,237,0.28)', border:'rgba(124,58,237,0.25)', dot:'#7c3aed' };
const getScheme = (icon: React.ElementType): Scheme => schemeMap.get(icon) ?? defaultScheme;

/* ─────────────────────────────────────────────────────────────────────────────
   NavSheet — premium bottom sheet with navigation grid
───────────────────────────────────────────────────────────────────────────── */
function NavSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout, isAdmin } = useAuth();
  const { t }     = useLanguage();
  const router    = useRouter();
  const haptic    = useHaptic();
  const pathname  = usePathname();
  const items     = isAdmin ? adminSheetDef : clientSheetDef;
  const roleLabel = isAdmin ? t('dash.role.admin') : t('dash.role.client');

  /* Drag-to-dismiss -------------------------------------------------------- */
  const dragControls = useDragControls();
  const sheetY       = useMotionValue(0);
  /* Backdrop fades out as sheet is dragged downward */
  const backdropOp   = useTransform(sheetY, [0, 200], [1, 0]);

  const handleClose = useCallback(() => {
    haptic('light');
    onClose();
  }, [haptic, onClose]);

  const handleLogout = useCallback(() => {
    haptic('medium');
    logout();
    toast.success(t('toast.loggedOut'));
    router.push('/');
    onClose();
  }, [haptic, logout, t, router, onClose]);

  /* Reset drag offset when sheet reopens */
  useEffect(() => { if (open) sheetY.set(0); }, [open, sheetY]);

  /* Body scroll lock + iOS push-back class */
  useEffect(() => {
    if (open) {
      document.body.classList.add('nav-sheet-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('nav-sheet-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('nav-sheet-open');
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = useCallback((href: string) => {
    const home = isAdmin ? '/dashboard/admin' : '/dashboard/client';
    if (href === home) return pathname === home;
    return pathname.startsWith(href);
  }, [isAdmin, pathname]);

  /* Spring config for sheet entrance */
  const sheetSpring = { type: 'spring' as const, damping: 30, stiffness: 300, mass: 0.88 };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ────────────────────────────────────────────────── */}
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position:             'fixed',
              inset:                0,
              zIndex:               9994,
              background:           'rgba(0,0,0,0.72)',
              backdropFilter:       'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          />

          {/* ── Sheet panel ─────────────────────────────────────────────── */}
          <motion.div
            key="nav-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={sheetSpring}
            /* Handle-driven drag-to-dismiss */
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.01, bottom: 0.55 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 550) {
                handleClose();
              }
            }}
            style={{
              position:             'fixed',
              left:                 0,
              right:                0,
              bottom:               0,
              display:              'flex',
              flexDirection:        'column',
              y:                    sheetY,
              zIndex:               9995,
              maxHeight:            'min(88svh, 680px)',
              background:           'rgba(7,7,10,0.97)',
              backdropFilter:       'blur(56px) saturate(1.9)',
              WebkitBackdropFilter: 'blur(56px) saturate(1.9)',
              borderRadius:         '24px 24px 0 0',
              borderTop:            '1px solid rgba(255,255,255,0.10)',
              boxShadow:            [
                '0 -4px 0 rgba(124,58,237,0.08)',
                '0 -16px 80px rgba(0,0,0,0.92)',
                '0 -1px 0 rgba(255,255,255,0.06)',
                'inset 0 1px 0 rgba(255,255,255,0.05)',
              ].join(', '),
            }}
          >
            {/* ── Top gradient line (brand accent) ─────────────────────── */}
            <div
              className="absolute top-0 left-8 right-8 h-[1px] rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(59,130,246,0.4), transparent)' }}
            />

            {/* ── Drag handle ─────────────────────────────────────────── */}
            <div
              className="flex flex-col items-center justify-center shrink-0 select-none"
              style={{ height: 44, cursor: 'grab', touchAction: 'none' }}
              onPointerDown={(e) => { e.preventDefault(); dragControls.start(e); }}
            >
              <motion.div
                className="rounded-full"
                style={{
                  width: 36, height: 4,
                  background: 'rgba(255,255,255,0.18)',
                }}
                whileTap={{ scaleX: 1.3, background: 'rgba(255,255,255,0.32)' }}
                transition={{ duration: 0.12 }}
              />
            </div>

            {/* ── User profile card ────────────────────────────────────── */}
            <div className="shrink-0 px-5 pb-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04, duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border:     '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center
                               text-white font-bold text-sm shrink-0 relative"
                  style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
                >
                  {user ? getInitials(user.name) : '?'}
                  {/* Online indicator */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                    style={{ background: '#10b981', border: '2px solid rgba(7,7,10,1)' }}
                  />
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm font-semibold truncate leading-tight">
                    {user?.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-400" />
                    </span>
                    <span className="text-slate-500 text-[11px]">{roleLabel}</span>
                  </div>
                </div>
                {/* Close button */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleClose}
                  aria-label="Close navigation"
                  className="w-8 h-8 flex items-center justify-center rounded-xl shrink-0
                             text-slate-500 transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border:     '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>

            {/* ── Navigation grid (scrollable) ─────────────────────────── */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Section label */}
              <div className="px-6 pb-3">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Navigation
                </span>
              </div>

              {/* 2-column grid */}
              <div className="grid grid-cols-2 gap-2.5 px-5 pb-3">
                {items.map((item, i) => {
                  const active  = isActive(item.href);
                  const Icon    = item.icon;
                  const scheme  = getScheme(Icon);

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 18, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.06 + i * 0.038,
                        type:  'spring', damping: 24, stiffness: 300, mass: 0.7,
                      }}
                    >
                      <Link href={item.href} onClick={handleClose} tabIndex={-1}>
                        <motion.div
                          whileTap={{ scale: 0.92 }}
                          transition={{ duration: 0.1 }}
                          onClick={() => haptic('selection')}
                          className="relative flex flex-col items-center justify-center
                                     gap-2 py-4 px-3 rounded-2xl overflow-hidden select-none"
                          style={active ? {
                            background: scheme.bg,
                            border:     `1px solid ${scheme.border}`,
                            boxShadow:  `0 0 28px ${scheme.glow}25`,
                          } : {
                            background: 'rgba(255,255,255,0.035)',
                            border:     '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          {/* Active: top glow line */}
                          {active && (
                            <div
                              className="absolute top-0 left-0 right-0 h-[2px]"
                              style={{
                                background: `linear-gradient(90deg, transparent 5%, ${scheme.text}cc, transparent 95%)`,
                              }}
                            />
                          )}

                          {/* Icon container (iOS app icon style) */}
                          <div
                            className="w-11 h-11 rounded-[14px] flex items-center justify-center relative"
                            style={active ? {
                              background: scheme.bg,
                              boxShadow:  `0 0 20px ${scheme.glow}`,
                            } : {
                              background: 'rgba(255,255,255,0.07)',
                            }}
                          >
                            <Icon
                              className="w-5 h-5"
                              style={{
                                color: active ? scheme.text : 'rgba(148,163,184,0.65)',
                              }}
                              strokeWidth={active ? 2.1 : 1.75}
                            />
                            {/* Notification dot on Message icons */}
                            {item.dot && (
                              <span
                                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                                style={{
                                  background: '#7c3aed',
                                  border:     '1.5px solid rgba(7,7,10,0.97)',
                                }}
                              />
                            )}
                          </div>

                          {/* Label */}
                          <span
                            className="text-[10.5px] font-medium leading-none text-center
                                       max-w-full truncate px-1"
                            style={{ color: active ? scheme.text : 'rgba(148,163,184,0.6)' }}
                          >
                            {t(item.labelKey)}
                          </span>

                          {/* Active: bottom dot */}
                          {active && (
                            <div
                              className="absolute bottom-1.5 w-1 h-1 rounded-full"
                              style={{ background: scheme.text, opacity: 0.75 }}
                            />
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.2 }}
              className="shrink-0 px-5 flex items-center gap-2.5"
              style={{
                paddingTop:    12,
                paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 0px) + 72px)',
                borderTop:     '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Visit website */}
              <Link
                href="/"
                onClick={handleClose}
                className="flex items-center gap-2 px-4 py-3 rounded-xl flex-1
                           text-slate-400 hover:text-white transition-all group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border:     '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-white transition-colors" />
                <span className="text-[12px] font-medium">Visit website</span>
              </Link>

              {/* Sign out */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 rounded-xl flex-1
                           text-slate-400 hover:text-red-400 transition-all group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border:     '1px solid rgba(255,255,255,0.07)',
                }}
                onTouchStart={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.09)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.22)';
                }}
                onTouchEnd={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0 group-hover:text-red-400 transition-colors" />
                <span className="text-[12px] font-medium">{t('dash.signOut')}</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BottomBar — primary mobile tab navigation (4 tabs + More button)
───────────────────────────────────────────────────────────────────────────── */
function BottomBar({
  sheetOpen,
  onToggle,
}: {
  sheetOpen: boolean;
  onToggle:  () => void;
}) {
  const { isAdmin } = useAuth();
  const { t }       = useLanguage();
  const pathname    = usePathname();
  const haptic      = useHaptic();
  const tabs        = isAdmin ? adminBottomDef : clientBottomDef;

  const isActive = (href: string) => {
    const home = isAdmin ? '/dashboard/admin' : '/dashboard/client';
    if (href === home) return pathname === home;
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden"
      style={{
        position:             'fixed',
        bottom:               0,
        left:                 0,
        right:                0,
        zIndex:               9999,
        background:           'rgba(6,6,9,0.97)',
        backdropFilter:       'blur(36px) saturate(2)',
        WebkitBackdropFilter: 'blur(36px) saturate(2)',
        borderTop:            '1px solid rgba(255,255,255,0.085)',
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
        {/* ── Regular nav tabs ─────────────────────────────────────── */}
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon   = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => haptic('selection')}
              className="relative flex flex-col items-center justify-center gap-[3px]
                         flex-1 py-2.5 min-h-[58px] group select-none"
              aria-current={active ? 'page' : undefined}
            >
              {/* Sliding pill indicator */}
              {active && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-x-1.5 top-1.5 h-[36px] rounded-[14px]"
                  style={{
                    background: 'rgba(124,58,237,0.18)',
                    border:     '1px solid rgba(124,58,237,0.3)',
                  }}
                  transition={{ type: 'spring', damping: 28, stiffness: 400, mass: 0.65 }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 w-[26px] h-[26px] flex items-center justify-center">
                <motion.div
                  animate={active ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 380 }}
                >
                  <Icon
                    style={{
                      width:  active ? 22 : 21,
                      height: active ? 22 : 21,
                      color:  active ? '#a78bfa' : 'rgba(100,116,139,0.85)',
                      filter: active ? 'drop-shadow(0 0 6px rgba(167,139,250,0.6))' : undefined,
                      transition: 'color 0.15s',
                    }}
                    strokeWidth={active ? 2.2 : 1.75}
                  />
                </motion.div>

                {/* Notification dot */}
                {tab.dot && (
                  <span className="absolute -top-0.5 -right-1 flex">
                    <span className="absolute inline-flex h-2 w-2 rounded-full bg-primary-500 opacity-70 animate-ping" />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"
                      style={{ border: '1.5px solid rgba(6,6,9,1)' }}
                    />
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="relative z-10 text-[9.5px] font-medium leading-none tracking-wide"
                style={{
                  color:      active ? '#a78bfa' : 'rgba(100,116,139,0.7)',
                  transition: 'color 0.15s',
                }}
              >
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}

        {/* ── More / Close button ───────────────────────────────────── */}
        <motion.button
          onClick={() => { haptic('light'); onToggle(); }}
          aria-label={sheetOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={sheetOpen}
          className="relative flex flex-col items-center justify-center gap-[3px]
                     flex-1 py-2.5 min-h-[58px] select-none"
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.1 }}
        >
          {/* Pill when sheet is open */}
          {sheetOpen && (
            <motion.div
              layoutId="tab-pill"
              className="absolute inset-x-1.5 top-1.5 h-[36px] rounded-[14px]"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border:     '1px solid rgba(255,255,255,0.14)',
              }}
              transition={{ type: 'spring', damping: 28, stiffness: 400, mass: 0.65 }}
            />
          )}

          {/* Animated icon: LayoutGrid ↔ X */}
          <div className="relative z-10 w-[26px] h-[26px] flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              {sheetOpen ? (
                <motion.div
                  key="x-icon"
                  initial={{ rotate: -120, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0,    opacity: 1, scale: 1   }}
                  exit={{    rotate: 120,  opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <X
                    style={{ width: 21, height: 21, color: 'rgba(226,232,240,0.9)' }}
                    strokeWidth={2.1}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="grid-icon"
                  initial={{ rotate: 120,  opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0,    opacity: 1, scale: 1   }}
                  exit={{    rotate: -120, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <LayoutGrid
                    style={{ width: 21, height: 21, color: 'rgba(100,116,139,0.85)' }}
                    strokeWidth={1.75}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Label */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={sheetOpen ? 'close-lbl' : 'more-lbl'}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -3 }}
              transition={{ duration: 0.14 }}
              className="relative z-10 text-[9.5px] font-medium leading-none tracking-wide"
              style={{ color: sheetOpen ? 'rgba(226,232,240,0.85)' : 'rgba(100,116,139,0.7)' }}
            >
              {sheetOpen ? 'Close' : 'More'}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MobileNav — orchestrator; portals both BottomBar and NavSheet to document.body
───────────────────────────────────────────────────────────────────────────── */
export default function MobileNav() {
  const pathname              = usePathname();
  const [open,    setOpen]    = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  /* Close sheet on route change */
  useEffect(() => { setOpen(false); }, [pathname]);

  /* Allow layout to open the sheet via a custom event (e.g., from avatar tap) */
  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener('open-nav-sheet', handler);
    return () => document.removeEventListener('open-nav-sheet', handler);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <NavSheet open={open} onClose={() => setOpen(false)} />
      <BottomBar sheetOpen={open} onToggle={() => setOpen((o) => !o)} />
    </>,
    document.body
  );
}
