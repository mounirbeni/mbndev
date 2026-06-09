'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, FolderOpen, Users, ShoppingBag, CreditCard,
  LayoutDashboard, BarChart2, Package, MessageSquare,
  Receipt, LogOut, Settings, ChevronRight, Command,
  Loader2, User, ExternalLink, Activity, Target,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { searchAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavAction {
  type: 'nav';
  id:   string;
  label: string;
  description?: string;
  icon: React.ElementType;
  href: string;
  group: string;
}

interface ActionItem {
  type:   'action';
  id:     string;
  label:  string;
  description?: string;
  icon:   React.ElementType;
  group:  string;
  run:    () => void;
}

interface SearchResult {
  type:        'project' | 'client' | 'order';
  id:          string;
  label:       string;
  description: string;
  href:        string;
  status?:     string;
}

type PaletteItem = NavAction | ActionItem | SearchResult;

// ─── Static items (navigation + quick actions) ────────────────────────────────

function useStaticItems(isAdmin: boolean, router: ReturnType<typeof useRouter>, logout: () => void): PaletteItem[] {
  const adminNav: NavAction[] = [
    { type: 'nav', id: 'admin-dash',     label: 'Dashboard',    icon: LayoutDashboard, href: '/dashboard/admin',            group: 'Admin Navigation' },
    { type: 'nav', id: 'admin-orders',   label: 'Orders',       icon: ShoppingBag,     href: '/dashboard/admin/orders',     group: 'Admin Navigation' },
    { type: 'nav', id: 'admin-projects', label: 'Projects',     icon: FolderOpen,      href: '/dashboard/admin/projects',   group: 'Admin Navigation' },
    { type: 'nav', id: 'admin-messages', label: 'Messages',     icon: MessageSquare,   href: '/dashboard/admin/messages',   group: 'Admin Navigation' },
    { type: 'nav', id: 'admin-clients',  label: 'Clients',      icon: Users,           href: '/dashboard/admin/clients',    group: 'Admin Navigation' },
    { type: 'nav', id: 'admin-packages', label: 'Packages',     icon: Package,         href: '/dashboard/admin/packages',   group: 'Admin Navigation' },
    { type: 'nav', id: 'admin-payments', label: 'Payments',     icon: CreditCard,      href: '/dashboard/admin/payments',   group: 'Admin Navigation' },
    { type: 'nav', id: 'admin-invoices', label: 'Invoices',     icon: Receipt,         href: '/dashboard/admin/invoices',   group: 'Admin Navigation' },
    { type: 'nav', id: 'admin-analytics',label: 'Analytics',    icon: BarChart2,       href: '/dashboard/admin/analytics',  group: 'Admin Navigation' },
    { type: 'nav', id: 'admin-activity', label: 'Activity Log', icon: Activity,        href: '/dashboard/admin/activity',   group: 'Admin Navigation' },
    { type: 'nav', id: 'admin-leads',    label: 'Leads',        icon: Target,          href: '/dashboard/admin/leads',      group: 'Admin Navigation' },
  ];

  const clientNav: NavAction[] = [
    { type: 'nav', id: 'client-dash',     label: 'Dashboard',   icon: LayoutDashboard, href: '/dashboard/client',           group: 'Navigation' },
    { type: 'nav', id: 'client-orders',   label: 'My Orders',   icon: ShoppingBag,     href: '/dashboard/client/orders',    group: 'Navigation' },
    { type: 'nav', id: 'client-projects', label: 'My Projects', icon: FolderOpen,      href: '/dashboard/client/projects',  group: 'Navigation' },
    { type: 'nav', id: 'client-messages', label: 'Messages',    icon: MessageSquare,   href: '/dashboard/client/messages',  group: 'Navigation' },
    { type: 'nav', id: 'client-payments', label: 'Payments',    icon: CreditCard,      href: '/dashboard/client/payments',  group: 'Navigation' },
    { type: 'nav', id: 'client-settings', label: 'Settings',    icon: Settings,        href: '/dashboard/client/settings',  group: 'Navigation' },
  ];

  const actions: ActionItem[] = [
    {
      type: 'action', id: 'go-home', label: 'Visit public site', icon: ExternalLink, group: 'Quick Actions',
      run: () => window.open('/', '_blank'),
    },
    {
      type: 'action', id: 'logout', label: 'Sign out', description: 'Log out of your account',
      icon: LogOut, group: 'Quick Actions',
      run: () => { logout(); router.push('/'); toast.success('Signed out'); },
    },
  ];

  return [...(isAdmin ? adminNav : clientNav), ...actions];
}

// ─── Status colour ────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending:     'text-yellow-400',
  paid:        'text-green-400',
  'in-progress':'text-blue-400',
  review:      'text-purple-400',
  revision:    'text-orange-400',
  completed:   'text-emerald-400',
  cancelled:   'text-red-400',
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function CommandPalette() {
  const router          = useRouter();
  const { isAdmin, logout } = useAuth();
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx]         = useState(0);
  const inputRef    = useRef<HTMLInputElement>(null);
  const listRef     = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const staticItems = useStaticItems(isAdmin, router, logout);

  // ── Open / close ──────────────────────────────────────────────────────────
  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery('');
    setSearchResults([]);
    setActiveIdx(0);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSearchResults([]);
  }, []);

  // ── Keyboard shortcut ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? closePalette() : openPalette();
      }
      if (e.key === 'Escape' && open) closePalette();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, openPalette, closePalette]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // ── Search ────────────────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setLoading(false);
      return;
    }
    if (!isAdmin) return; // search is admin-only

    setLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const { data } = await searchAPI.global(query.trim());
        const results: SearchResult[] = [
          ...data.results.projects.map((p: any) => ({
            type: 'project' as const,
            id:   `project-${p.id}`,
            label: p.title,
            description: `${p.client?.name ?? ''} · ${p.status}`,
            href:  `/dashboard/admin/projects/${p.id}`,
            status: p.status,
          })),
          ...data.results.clients.map((c: any) => ({
            type: 'client' as const,
            id:   `client-${c.id}`,
            label: c.name,
            description: c.email + (c.company ? ` · ${c.company}` : ''),
            href:  `/dashboard/admin/clients`,
            status: c.isActive ? 'active' : 'inactive',
          })),
          ...data.results.orders.map((o: any) => ({
            type: 'order' as const,
            id:   `order-${o.id}`,
            label: o.title,
            description: `${o.client?.name ?? ''} · ${o.serviceType} · $${o.totalPrice}`,
            href:  `/dashboard/admin/orders`,
            status: o.status,
          })),
        ];
        setSearchResults(results);
        setActiveIdx(0);
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [query, isAdmin]);

  // ── Filtered static items ─────────────────────────────────────────────────
  const filteredStatic = query.trim()
    ? staticItems.filter((i) =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        (i.description ?? '').toLowerCase().includes(query.toLowerCase()),
      )
    : staticItems;

  // ── Visible items list ────────────────────────────────────────────────────
  const allItems: PaletteItem[] = query.trim()
    ? [...searchResults, ...filteredStatic]
    : filteredStatic;

  // ── Navigation ────────────────────────────────────────────────────────────
  const runItem = useCallback((item: PaletteItem) => {
    if (item.type === 'action') {
      item.run();
    } else {
      router.push(item.href);
    }
    closePalette();
  }, [router, closePalette]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[activeIdx]) runItem(allItems[activeIdx]);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-active="true"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  // ── Group items ───────────────────────────────────────────────────────────
  const grouped = allItems.reduce<Record<string, PaletteItem[]>>((acc, item) => {
    const g = item.type === 'project' ? 'Projects'
            : item.type === 'client'  ? 'Clients'
            : item.type === 'order'   ? 'Orders'
            : (item as NavAction | ActionItem).group;
    acc[g] = acc[g] ?? [];
    acc[g].push(item);
    return acc;
  }, {});

  // ── Icon by search result type ─────────────────────────────────────────────
  const SearchResultIcon = ({ type }: { type: string }) => {
    if (type === 'project') return <FolderOpen className="w-4 h-4" />;
    if (type === 'client')  return <User       className="w-4 h-4" />;
    if (type === 'order')   return <ShoppingBag className="w-4 h-4" />;
    return <Search className="w-4 h-4" />;
  };

  if (!open) {
    return (
      <button
        onClick={openPalette}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-500
                   border border-white/6 hover:border-white/12 hover:text-slate-400
                   transition-all bg-white/3 hover:bg-white/5"
        title="Open command palette (⌘K)"
      >
        <Command className="w-3 h-3" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline text-[10px] opacity-60">⌘K</kbd>
      </button>
    );
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={closePalette}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[12vh] z-[9999] w-full max-w-xl -translate-x-1/2"
            onKeyDown={handleKeyDown}
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background:   'rgba(12, 12, 16, 0.98)',
                border:       '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(40px)',
              }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
                {loading
                  ? <Loader2 className="w-4 h-4 text-purple-400 shrink-0 animate-spin" />
                  : <Search  className="w-4 h-4 text-slate-500 shrink-0" />
                }
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                  placeholder={isAdmin ? 'Search projects, clients, orders or navigate…' : 'Navigate or search…'}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                />
                <kbd
                  className="text-[10px] px-1.5 py-0.5 rounded border border-white/10
                             text-slate-600 font-mono shrink-0"
                >
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
                {allItems.length === 0 && query.trim().length >= 2 && !loading && (
                  <div className="px-4 py-8 text-center text-sm text-slate-600">
                    No results for &ldquo;{query}&rdquo;
                  </div>
                )}
                {allItems.length === 0 && query.trim().length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-slate-600">
                    Start typing to search…
                  </div>
                )}

                {Object.entries(grouped).map(([group, items]) => (
                  <div key={group} className="mb-1">
                    <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
                      {group}
                    </div>
                    {items.map((item) => {
                      const idx = allItems.indexOf(item);
                      const isActive = idx === activeIdx;
                      const IconComp = item.type === 'project' || item.type === 'client' || item.type === 'order'
                        ? null
                        : (item as NavAction | ActionItem).icon;

                      return (
                        <button
                          key={item.id}
                          data-active={isActive}
                          onClick={() => runItem(item)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            isActive ? 'bg-white/6' : 'hover:bg-white/4',
                          )}
                        >
                          <span className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                            isActive ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-500',
                          )}>
                            {IconComp
                              ? <IconComp className="w-3.5 h-3.5" />
                              : <SearchResultIcon type={item.type} />
                            }
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className={cn('text-sm truncate', isActive ? 'text-white' : 'text-slate-300')}>
                              {item.label}
                            </div>
                            {item.description && (
                              <div className="text-xs text-slate-600 truncate">{item.description}</div>
                            )}
                          </div>
                          {item.type !== 'action' && (
                            <ChevronRight className={cn(
                              'w-3.5 h-3.5 shrink-0 transition-opacity',
                              isActive ? 'text-slate-500 opacity-100' : 'opacity-0',
                            )} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/6 text-[10px] text-slate-700">
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span>ESC close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
