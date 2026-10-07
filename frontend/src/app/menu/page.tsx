'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UtensilsCrossed, Loader2, Eye, BellRing, Languages, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useMenuApp } from '@/components/menu/MenuShell';
import { menuAPI, type MenuRestaurantSummary } from '@/lib/api';
import { photoUrl } from '@/lib/menu';

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const inputCls = 'rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none';

export default function MenuRestaurantsPage() {
  const router = useRouter();
  const { account, refresh } = useMenuApp();
  const [restaurants, setRestaurants] = useState<MenuRestaurantSummary[] | null>(null);
  const [name, setName] = useState('');
  const [sample, setSample] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => menuAPI.restaurants().then(
    ({ data }) => setRestaurants(data.restaurants),
    () => { toast.error('Could not load your restaurants.'); setRestaurants([]); },
  ), []);
  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await menuAPI.createRestaurant({ name: name.trim(), sample });
      toast.success('Restaurant created');
      refresh();
      router.push(`/menu/r/${data.restaurant.id}?tab=${sample ? 'menu' : 'details'}`);
    } catch (err) {
      toast.error(errMsg(err, 'Could not create the restaurant.'));
      setCreating(false);
    }
  };

  const full = account.restaurants.used >= account.restaurants.limit;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Your restaurants</h1>
      <p className="mt-1 text-slate-400">Each restaurant gets a digital menu link, table QR codes, live orders and bookings.</p>

      {!full && (
        <form onSubmit={create} className="mt-6 grid gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-[1fr_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Restaurant name" aria-label="Restaurant name" maxLength={80} required className={inputCls} />
          <Button type="submit" loading={creating}>Create menu</Button>
          <label className="flex items-start gap-2.5 text-sm text-slate-300 sm:col-span-2">
            <input type="checkbox" checked={sample} onChange={(e) => setSample(e.target.checked)} className="mt-0.5 h-4 w-4 accent-violet-500" />
            <span><b className="text-white">Start from the sample menu</b> — 24 Mediterranean dishes in 5 languages with allergens, options and opening hours. Edit or delete anything after.</span>
          </label>
        </form>
      )}
      <p className="mt-2 text-xs text-slate-500">{account.restaurants.used} of {account.restaurants.limit} restaurant{account.restaurants.limit === 1 ? '' : 's'} used on your {account.plan} plan.</p>

      {restaurants === null ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
      ) : restaurants.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
          <Sparkles className="mx-auto mb-3 h-6 w-6 text-violet-300" />
          Create your first restaurant above. With the sample menu you can open the guest page and try ordering straight away.
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {restaurants.map((r) => (
            <li key={r.id}>
              <Link href={`/menu/r/${r.id}${r.newRequests ? '?tab=live' : ''}`} className="block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/15">
                <div className="flex items-center gap-3">
                  {r.logoPhotoId
                    // eslint-disable-next-line @next/next/no-img-element -- our own resized photo
                    ? <img src={photoUrl(r.logoPhotoId)!} alt="" className="h-10 w-10 rounded-xl object-cover" />
                    : <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: r.color }}><UtensilsCrossed className="h-5 w-5" /></span>}
                  <p className="min-w-0 flex-1 truncate font-semibold text-white">{r.name}</p>
                  {!r.active && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-slate-400">Hidden</span>}
                  {r.newRequests > 0 && <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-200"><BellRing className="h-3 w-3" />{r.newRequests} new</span>}
                </div>
                <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><UtensilsCrossed className="h-3.5 w-3.5" />{r.dishes} dishes</span>
                  <span className="flex items-center gap-1"><Languages className="h-3.5 w-3.5" />{r.languages.map((l) => l.toUpperCase()).join(' · ')}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{r.views} visits</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
