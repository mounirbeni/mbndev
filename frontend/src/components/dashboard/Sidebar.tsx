'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, MessageSquare, CreditCard,
  Settings, LogOut, Users, Package, BarChart2,
  ChevronRight, ShoppingBag, ExternalLink, Receipt,
} from 'lucide-react';
import Logo3D from '@/components/ui/Logo3D';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, getInitials } from '@/lib/utils';
import { APP_VERSION } from '@/lib/version';
import toast from 'react-hot-toast';

interface NavItem {
  labelKey: string;
  href:     string;
  icon:     React.ElementType;
  badge?:   number | string;
}

const adminNavDef: NavItem[] = [
  { labelKey: 'dash.nav.dashboard', href: '/dashboard/admin',           icon: LayoutDashboard },
  { labelKey: 'dash.nav.orders',    href: '/dashboard/admin/orders',    icon: ShoppingBag },
  { labelKey: 'dash.nav.projects',  href: '/dashboard/admin/projects',  icon: FolderOpen },
  { labelKey: 'dash.nav.messages',  href: '/dashboard/admin/messages',  icon: MessageSquare },
  { labelKey: 'dash.nav.clients',   href: '/dashboard/admin/clients',   icon: Users },
  { labelKey: 'dash.nav.packages',  href: '/dashboard/admin/packages',  icon: Package },
  { labelKey: 'dash.nav.payments',  href: '/dashboard/admin/payments',  icon: CreditCard },
  { labelKey: 'dash.nav.invoices',  href: '/dashboard/admin/invoices',  icon: Receipt },
  { labelKey: 'dash.nav.analytics', href: '/dashboard/admin/analytics', icon: BarChart2 },
];

const clientNavDef: NavItem[] = [
  { labelKey: 'dash.nav.dashboard',  href: '/dashboard/client',           icon: LayoutDashboard },
  { labelKey: 'dash.nav.myOrders',   href: '/dashboard/client/orders',    icon: ShoppingBag },
  { labelKey: 'dash.nav.myProjects', href: '/dashboard/client/projects',  icon: FolderOpen },
  { labelKey: 'dash.nav.messages',   href: '/dashboard/client/messages',  icon: MessageSquare },
  { labelKey: 'dash.nav.payments',   href: '/dashboard/client/payments',  icon: CreditCard },
  { labelKey: 'dash.nav.settings',   href: '/dashboard/client/settings',  icon: Settings },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { t }       = useLanguage();
  const pathname    = usePathname();
  const router      = useRouter();
  const navDef      = isAdmin ? adminNavDef : clientNavDef;

  const handleLogout = () => {
    logout();
    toast.success(t('toast.loggedOut'));
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;
  const roleLabel = isAdmin ? t('dash.role.admin') : t('dash.role.client');

  return (
    <div
      className="flex flex-col h-full select-none w-64 border-r border-white/6"
      style={{
        background:          'rgba(8, 8, 11, 0.98)',
        backdropFilter:      'blur(40px)',
        WebkitBackdropFilter:'blur(40px)',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="px-4 flex items-center justify-between border-b border-white/6 shrink-0"
        style={{ paddingTop: '18px', paddingBottom: '16px' }}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo3D size="sm" />
          <span className="text-white font-bold text-[15px] tracking-wide">MBN DEV</span>
        </Link>

        <Link
          href="/"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600
                     hover:text-slate-400 hover:bg-white/6 transition-colors"
          title="Visit site"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── User card ───────────────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border:     '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center
                        text-white font-bold text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
          >
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-sm font-semibold leading-tight truncate">
              {user?.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-400" />
              </span>
              <span className="text-slate-500 text-[11px] capitalize">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav label ──────────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-1 shrink-0">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          Navigation
        </span>
      </div>

      {/* ── Nav items ───────────────────────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {navDef.map((item) => {
          const active = isActive(item.href);
          const Icon   = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm',
                'transition-all duration-150 group relative',
                active
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-white font-medium'
              )}
              style={active ? {
                background:   'rgba(124,58,237,0.15)',
                border:       '1px solid rgba(124,58,237,0.22)',
                boxShadow:    '0 0 12px rgba(124,58,237,0.08)',
              } : {
                border:       '1px solid transparent',
              }}
            >
              {/* Active indicator glow */}
              {active && (
                <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary-500" />
              )}

              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150',
                  active ? '' : 'group-hover:bg-white/6'
                )}
                style={active ? { background: 'rgba(124,58,237,0.22)' } : {}}
              >
                <Icon className={cn(
                  'w-[15px] h-[15px] transition-colors',
                  active ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'
                )} strokeWidth={active ? 2 : 1.8} />
              </div>

              <span className="flex-1 leading-none">{t(item.labelKey)}</span>

              {item.badge ? (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white
                                  text-[9px] font-bold flex items-center justify-center shrink-0">
                  {item.badge}
                </span>
              ) : active ? (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-slate-700 opacity-0 group-hover:opacity-100
                                          transition-opacity shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Version badge ───────────────────────────────────────────────────── */}
      <div className="px-5 pb-2 shrink-0">
        <span
          className="text-[10px] font-semibold tabular-nums"
          style={{ color: 'rgba(124,58,237,0.55)' }}
        >
          v{APP_VERSION}
        </span>
      </div>

      {/* ── Sign out ────────────────────────────────────────────────────────── */}
      <div
        className="px-3 pt-2 pb-4 border-t border-white/6 shrink-0"
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                     text-slate-500 hover:text-red-400 transition-all group"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.background     = 'rgba(239,68,68,0.07)';
            e.currentTarget.style.borderColor    = 'rgba(239,68,68,0.16)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = '';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                          group-hover:bg-red-500/12 transition-colors">
            <LogOut className="w-[15px] h-[15px]" strokeWidth={1.8} />
          </div>
          {t('dash.signOut')}
        </button>
      </div>
    </div>
  );
}

