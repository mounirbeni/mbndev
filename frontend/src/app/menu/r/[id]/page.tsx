'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { useMenuApp } from '@/components/menu/MenuShell';
import MenuEditor from '@/components/menu/MenuEditor';
import DetailsTab from '@/components/menu/DetailsTab';
import LiveTab from '@/components/menu/LiveTab';
import ShareTab from '@/components/menu/ShareTab';
import { menuAPI, type MenuRestaurant } from '@/lib/api';

type Tab = 'live' | 'menu' | 'details' | 'share';
const TABS: [Tab, string][] = [['live', 'Live orders'], ['menu', 'Menu'], ['details', 'Details & hours'], ['share', 'Link & QR codes']];

export default function MenuRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { refresh } = useMenuApp();
  const [restaurant, setRestaurant] = useState<MenuRestaurant | null>(null);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState<Tab>('menu');

  useEffect(() => {
    menuAPI.restaurant(id).then(({ data }) => {
      setRestaurant(data.restaurant);
      const t = new URLSearchParams(window.location.search).get('tab') as Tab | null;
      if (t && TABS.some(([k]) => k === t)) setTab(t);
    }, () => setMissing(true));
  }, [id]);

  const switchTab = (t: Tab) => {
    setTab(t);
    window.history.replaceState(null, '', `?tab=${t}`);
  };

  const remove = async () => {
    if (!restaurant || !window.confirm(`Delete ${restaurant.name}? Its menu link and QR codes stop working, and its orders and bookings are deleted.`)) return;
    try { await menuAPI.deleteRestaurant(id); await refresh(); router.push('/menu'); } catch { toast.error('Could not delete.'); }
  };

  if (missing) return <p className="py-24 text-center text-slate-400">Restaurant not found. <Link href="/menu" className="underline">Back to your restaurants</Link></p>;
  if (!restaurant) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>;

  return (
    <div>
      <Link href="/menu" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Restaurants</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="h-9 w-9 shrink-0 rounded-xl" style={{ background: restaurant.color }} />
        <h1 className="min-w-0 flex-1 truncate text-2xl font-bold text-white sm:text-3xl">{restaurant.name}</h1>
        <a href={`/m/${restaurant.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3.5 py-2 text-sm text-slate-200 hover:border-white/30">
          <ExternalLink className="h-4 w-4" />Open guest menu
        </a>
      </div>

      <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-white/[0.06]" aria-label="Restaurant">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => switchTab(k)} aria-current={tab === k ? 'page' : undefined}
            className={`-mb-px shrink-0 border-b-2 px-3.5 py-2.5 text-sm ${tab === k ? 'border-violet-400 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>{label}</button>
        ))}
      </nav>

      <div className="mt-5">
        {tab === 'live' && <LiveTab restaurant={restaurant} />}
        {tab === 'menu' && <MenuEditor key={restaurant.languages.join()} restaurant={restaurant} onSaved={setRestaurant} />}
        {tab === 'details' && <DetailsTab restaurant={restaurant} onSaved={setRestaurant} onDelete={remove} />}
        {tab === 'share' && <ShareTab restaurant={restaurant} />}
      </div>
    </div>
  );
}
