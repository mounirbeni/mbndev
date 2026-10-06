'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Users, Settings, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { leadsAiAPI, type LeadsAiAccount } from '@/lib/api';

type Status = 'loading' | 'ready' | 'no-access' | 'error';

interface Ctx {
  account: LeadsAiAccount | null;
  languages: string[];
  setAccount: (a: LeadsAiAccount) => void;
  refresh: () => Promise<void>;
}

const LeadsAiContext = createContext<Ctx | null>(null);

export function useLeadsAi() {
  const ctx = useContext(LeadsAiContext);
  if (!ctx) throw new Error('useLeadsAi must be used inside LeadsAiShell');
  return ctx;
}

const TABS = [
  { href: '/leads-ai',          label: 'Find leads', icon: Search   },
  { href: '/leads-ai/leads',    label: 'My leads',   icon: Users    },
  { href: '/leads-ai/settings', label: 'Settings',   icon: Settings },
];

export default function LeadsAiShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>('loading');
  const [account, setAccount] = useState<LeadsAiAccount | null>(null);
  const [languages, setLanguages] = useState<string[]>(['en']);

  const refresh = useCallback(() => leadsAiAPI.me().then(
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

  useEffect(() => { refresh(); }, [refresh]);

  const usage = account?.searches;

  return (
    <div className="min-h-screen bg-[#07060f] text-slate-200">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#07060f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/products/leads-ai" className="flex items-center gap-2 font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">MBN Leads AI</span>
          </Link>
          {status === 'ready' && (
            <nav className="ml-2 flex items-center gap-1" aria-label="Leads AI">
              {TABS.map(({ href, label, icon: Icon }) => {
                const active = href === '/leads-ai' ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
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
                {account?.plan.toUpperCase()} · {usage.limit === null ? 'Unlimited searches' : `${usage.remaining}/${usage.limit} searches left`}
              </span>
            )}
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> MBN DEV
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {status === 'loading' && (
          <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
        )}
        {status === 'error' && (
          <p className="py-24 text-center text-slate-400">Something went wrong loading your account. Refresh the page to try again.</p>
        )}
        {status === 'no-access' && (
          <div className="mx-auto max-w-md py-20 text-center">
            <h1 className="text-2xl font-bold text-white">MBN Leads AI isn&apos;t active on this account</h1>
            <p className="mt-3 text-slate-400">Find businesses that need your services and know exactly what to say to them.</p>
            <Link href="/products/leads-ai" className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#14092b]">
              See MBN Leads AI
            </Link>
          </div>
        )}
        {status === 'ready' && account && (
          <LeadsAiContext.Provider value={{ account, languages, setAccount, refresh }}>
            {children}
          </LeadsAiContext.Provider>
        )}
      </main>
    </div>
  );
}
