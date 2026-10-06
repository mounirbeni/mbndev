'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FilePlus2, Files, Settings, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react';
import { localGrowthAPI, type LocalGrowthAccount } from '@/lib/api';

type Status = 'loading' | 'ready' | 'no-access' | 'error';

interface Ctx {
  account: LocalGrowthAccount;
  languages: string[];
  setAccount: (a: LocalGrowthAccount) => void;
}

const LocalGrowthContext = createContext<Ctx | null>(null);

export function useLocalGrowth() {
  const ctx = useContext(LocalGrowthContext);
  if (!ctx) throw new Error('useLocalGrowth must be used inside LocalGrowthShell');
  return ctx;
}

const TABS = [
  { href: '/local-growth',          label: 'New report', icon: FilePlus2 },
  { href: '/local-growth/reports',  label: 'Reports',    icon: Files     },
  { href: '/local-growth/settings', label: 'Settings',   icon: Settings  },
];

export default function LocalGrowthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>('loading');
  const [account, setAccount] = useState<LocalGrowthAccount | null>(null);
  const [languages, setLanguages] = useState<string[]>(['en']);

  const load = useCallback(() => localGrowthAPI.me().then(
    ({ data }) => {
      setAccount(data.account);
      setLanguages(data.languages || ['en']);
      setStatus('ready');
    },
    (err) => {
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      setStatus(code === 'NO_LICENSE' ? 'no-access' : 'error');
    },
  ), []);

  useEffect(() => { load(); }, [load]);

  const usage = account?.reports;

  return (
    <div className="min-h-screen bg-[#07060f] text-slate-200 print:bg-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#07060f]/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/products/local-growth" className="flex items-center gap-2 font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
              <TrendingUp className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">MBN Local Growth</span>
          </Link>
          {status === 'ready' && (
            <nav className="ml-2 flex items-center gap-1" aria-label="Local Growth">
              {TABS.map(({ href, label, icon: Icon }) => {
                const active = href === '/local-growth' ? pathname === href : pathname.startsWith(href);
                return (
                  <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
            {usage && (
              <span className="hidden rounded-full border border-white/10 px-2.5 py-1 sm:inline">
                {account?.plan.toUpperCase()} · {usage.limit === null ? 'Unlimited reports' : `${usage.remaining}/${usage.limit} reports left`}
              </span>
            )}
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> MBN DEV</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 print:max-w-none print:p-0">
        {status === 'loading' && <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>}
        {status === 'error' && <p className="py-24 text-center text-slate-400">Something went wrong loading your account. Refresh the page to try again.</p>}
        {status === 'no-access' && (
          <div className="mx-auto max-w-md py-20 text-center">
            <h1 className="text-2xl font-bold text-white">MBN Local Growth isn&apos;t active on this account</h1>
            <p className="mt-3 text-slate-400">See exactly how any local business compares to its competitors online — and what to fix first.</p>
            <Link href="/products/local-growth" className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#14092b]">See MBN Local Growth</Link>
          </div>
        )}
        {status === 'ready' && account && (
          <LocalGrowthContext.Provider value={{ account, languages, setAccount }}>{children}</LocalGrowthContext.Provider>
        )}
      </main>
    </div>
  );
}
