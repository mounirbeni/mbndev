'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { menuAPI, type MenuHours, type MenuLang, type MenuRestaurant } from '@/lib/api';
import { CURRENCIES, MENU_COPY, MENU_LANGS, PAYMENT_IDS, hhmm, paymentLabel, photoUrl } from '@/lib/menu';
import { resizePhoto } from './photo';
import { LocalizedField, Toggle, errMsg, fieldCls, labelCls } from './ui';

const TIMEZONES = ['Europe/Lisbon', 'Europe/Madrid', 'Europe/Paris', 'Europe/Rome', 'Europe/Berlin', 'Europe/London', 'Europe/Brussels', 'Europe/Zurich', 'Africa/Casablanca', 'Atlantic/Madeira', 'Atlantic/Canary'];
const DAYS = [1, 2, 3, 4, 5, 6, 0];
const toMin = (v: string) => { const [h, m] = v.split(':').map(Number); return h * 60 + m; };

type Form = Pick<MenuRestaurant, 'name' | 'tagline' | 'about' | 'color' | 'languages' | 'defaultLanguage' | 'currency' | 'timezone'
  | 'address' | 'phone' | 'whatsapp' | 'email' | 'instagram' | 'website' | 'wifiName' | 'wifiPassword' | 'logoPhotoId' | 'coverPhotoId'
  | 'hours' | 'payments' | 'ordering' | 'booking' | 'waiterCall' | 'coverCharge'> & { active: boolean };

const pick = (r: MenuRestaurant): Form => ({
  name: r.name, tagline: r.tagline, about: r.about, color: r.color, languages: r.languages, defaultLanguage: r.defaultLanguage,
  currency: r.currency, timezone: r.timezone, address: r.address, phone: r.phone, whatsapp: r.whatsapp, email: r.email,
  instagram: r.instagram, website: r.website, wifiName: r.wifiName, wifiPassword: r.wifiPassword, logoPhotoId: r.logoPhotoId,
  coverPhotoId: r.coverPhotoId, hours: r.hours, payments: r.payments, ordering: r.ordering, booking: r.booking,
  waiterCall: r.waiterCall, coverCharge: r.coverCharge, active: r.active ?? true,
});

export default function DetailsTab({ restaurant, onSaved, onDelete }: { restaurant: MenuRestaurant; onSaved: (r: MenuRestaurant) => void; onDelete: () => void }) {
  const [f, setF] = useState<Form>(() => pick(restaurant));
  const [lang, setLang] = useState<MenuLang>(restaurant.defaultLanguage);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logoPhotoId' | 'coverPhotoId' | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<Form>) => setF((x) => ({ ...x, ...patch }));

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const { data } = await menuAPI.updateRestaurant(restaurant.id, f);
      setF(pick(data.restaurant));
      onSaved(data.restaurant);
      toast.success('Saved');
    } catch (err) {
      toast.error(errMsg(err, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  const upload = async (field: 'logoPhotoId' | 'coverPhotoId', file?: File) => {
    if (!file) return;
    setUploading(field);
    try {
      const data = await resizePhoto(file, field === 'logoPhotoId' ? 400 : 1600);
      const res = await menuAPI.uploadPhoto(restaurant.id, data);
      set({ [field]: res.data.id });
    } catch (err) {
      toast.error(err instanceof Error && !('response' in err) ? err.message : errMsg(err, 'Could not upload.'));
    } finally {
      setUploading(null);
    }
  };

  const setRange = (day: number, i: number, which: 0 | 1, value: string) => {
    const ranges = (f.hours[day] || []).map((r) => [...r] as [number, number]);
    let m = toMin(value);
    if (which === 1 && m <= ranges[i][0]) m += 1440; // closes after midnight
    ranges[i][which] = m;
    set({ hours: { ...f.hours, [day]: ranges } as MenuHours });
  };
  const langs = MENU_LANGS.filter((l) => f.languages.includes(l.id)).map((l) => l.id);

  const section = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4';
  const text = (key: keyof Form, label: string, placeholder = '', type = 'text') => (
    <label className="block"><span className={labelCls}>{label}</span>
      <input type={type} value={(f[key] as string | null) ?? ''} placeholder={placeholder} onChange={(e) => set({ [key]: e.target.value } as Partial<Form>)} className={`${fieldCls} mt-1.5`} />
    </label>
  );

  return (
    <form onSubmit={save} className="max-w-3xl space-y-5">
      <section className={section}>
        <h2 className="font-semibold text-white">Restaurant</h2>
        <label className="block"><span className={labelCls}>Name</span>
          <input value={f.name} onChange={(e) => set({ name: e.target.value })} maxLength={80} required className={`${fieldCls} mt-1.5`} /></label>
        <div className="flex flex-wrap gap-1">
          {langs.map((l) => <button type="button" key={l} onClick={() => setLang(l)} className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold ${lang === l ? 'bg-violet-500 text-white' : 'bg-white/[0.05] text-slate-400'}`}>{l.toUpperCase()}</button>)}
        </div>
        <LocalizedField label="Tagline" value={f.tagline} lang={lang} fallback={f.defaultLanguage} maxLength={140} onChange={(tagline) => set({ tagline })} />
        <LocalizedField label="About" value={f.about} lang={lang} fallback={f.defaultLanguage} maxLength={800} multiline onChange={(about) => set({ about })} />
        <div className="flex flex-wrap gap-5">
          <div><span className={labelCls}>Logo</span>
            <button type="button" onClick={() => logoRef.current?.click()} className="mt-1.5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-slate-400">
              {uploading === 'logoPhotoId' ? <Loader2 className="h-5 w-5 animate-spin" />
                // eslint-disable-next-line @next/next/no-img-element -- our own resized photo
                : f.logoPhotoId ? <img src={photoUrl(f.logoPhotoId)!} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5" />}
            </button>
            {f.logoPhotoId && <button type="button" onClick={() => set({ logoPhotoId: null })} className="mt-1 text-[11px] text-slate-500 hover:text-rose-300">Remove</button>}
            <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => upload('logoPhotoId', e.target.files?.[0])} />
          </div>
          <div className="min-w-0 flex-1"><span className={labelCls}>Cover photo (top of the menu)</span>
            <button type="button" onClick={() => coverRef.current?.click()} className="mt-1.5 flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-slate-400">
              {uploading === 'coverPhotoId' ? <Loader2 className="h-5 w-5 animate-spin" />
                // eslint-disable-next-line @next/next/no-img-element -- our own resized photo
                : f.coverPhotoId ? <img src={photoUrl(f.coverPhotoId)!} alt="" className="h-full w-full object-cover" /> : <span className="flex items-center gap-2 text-sm"><ImagePlus className="h-5 w-5" />Optional — without one, your colour is used</span>}
            </button>
            {f.coverPhotoId && <button type="button" onClick={() => set({ coverPhotoId: null })} className="mt-1 text-[11px] text-slate-500 hover:text-rose-300">Remove</button>}
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={(e) => upload('coverPhotoId', e.target.files?.[0])} />
          </div>
          <label className="block"><span className={labelCls}>Brand colour</span>
            <span className="mt-1.5 flex items-center gap-2">
              <input type="color" value={f.color} onChange={(e) => set({ color: e.target.value })} className="h-11 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
              <span className="font-mono text-xs text-slate-400">{f.color}</span>
            </span>
          </label>
        </div>
      </section>

      <section className={section}>
        <h2 className="font-semibold text-white">Languages & money</h2>
        <div>
          <span className={labelCls}>Menu languages (guests choose; ★ = main language)</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {MENU_LANGS.map((l) => {
              const on = f.languages.includes(l.id);
              return (
                <span key={l.id} className={`flex items-center overflow-hidden rounded-full border text-sm ${on ? 'border-violet-400/50 bg-violet-500/15 text-white' : 'border-white/10 text-slate-400'}`}>
                  <button type="button" className="px-3 py-1.5" onClick={() => {
                    const next = on ? f.languages.filter((x) => x !== l.id) : [...f.languages, l.id];
                    if (!next.length) return;
                    set({ languages: next, defaultLanguage: next.includes(f.defaultLanguage) ? f.defaultLanguage : next[0] });
                  }}>{l.label}</button>
                  {on && <button type="button" title="Main language" onClick={() => set({ defaultLanguage: l.id })} className={`border-l border-white/10 px-2 py-1.5 ${f.defaultLanguage === l.id ? 'text-amber-300' : 'text-slate-500 hover:text-amber-200'}`}>★</button>}
                </span>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">Write the menu in the main language, then use “Translate with AI” in the Menu tab to fill the others.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block"><span className={labelCls}>Currency</span>
            <select value={f.currency} onChange={(e) => set({ currency: e.target.value })} className={`${fieldCls} mt-1.5 bg-[#0b0a14]`}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="block"><span className={labelCls}>Time zone</span>
            <select value={f.timezone} onChange={(e) => set({ timezone: e.target.value })} className={`${fieldCls} mt-1.5 bg-[#0b0a14]`}>{[...new Set([f.timezone, ...TIMEZONES])].map((z) => <option key={z}>{z}</option>)}</select></label>
          <label className="block"><span className={labelCls}>Cover charge / person</span>
            <input type="number" min={0} max={50} step="0.1" value={f.coverCharge} onChange={(e) => set({ coverCharge: Number(e.target.value) })} className={`${fieldCls} mt-1.5`} /></label>
        </div>
        <div>
          <span className={labelCls}>Payments accepted</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PAYMENT_IDS.map((p) => {
              const on = f.payments.includes(p);
              return <button type="button" key={p} onClick={() => set({ payments: on ? f.payments.filter((x) => x !== p) : [...f.payments, p] })}
                className={`rounded-full border px-3 py-1.5 text-xs ${on ? 'border-violet-400/50 bg-violet-500/15 text-white' : 'border-white/10 text-slate-400'}`}>{paymentLabel(p, MENU_COPY.en)}</button>;
            })}
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className="font-semibold text-white">Opening hours</h2>
        <p className="-mt-2 text-xs text-slate-500">Used for the “Open now” badge and the booking times (every 30 min, last one an hour before closing).</p>
        <div className="divide-y divide-white/[0.05]">
          {DAYS.map((d) => {
            const ranges = f.hours[d] || [];
            return (
              <div key={d} className="flex flex-wrap items-center gap-2 py-2.5">
                <span className="w-24 text-sm text-slate-300">{MENU_COPY.en.days[d]}</span>
                {ranges.length === 0 && <span className="text-sm text-slate-500">Closed</span>}
                {ranges.map(([o, c], i) => (
                  <span key={i} className="flex items-center gap-1">
                    <input type="time" step={900} value={hhmm(o)} onChange={(e) => setRange(d, i, 0, e.target.value)} className={`${fieldCls} w-[7.2rem] py-1.5`} aria-label="Opens" />
                    <span className="text-slate-500">–</span>
                    <input type="time" step={900} value={hhmm(c)} onChange={(e) => setRange(d, i, 1, e.target.value)} className={`${fieldCls} w-[7.2rem] py-1.5`} aria-label="Closes" />
                    <button type="button" aria-label="Remove" onClick={() => set({ hours: { ...f.hours, [d]: ranges.filter((_, k) => k !== i) } })} className="p-1 text-slate-500 hover:text-rose-300"><X className="h-4 w-4" /></button>
                  </span>
                ))}
                {ranges.length < 3 && (
                  <button type="button" onClick={() => set({ hours: { ...f.hours, [d]: [...ranges, ranges.length ? [1140, 1380] : [720, 900]] } })} className="flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-white"><Plus className="h-3.5 w-3.5" />{ranges.length ? 'Add evening' : 'Add hours'}</button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className={section}>
        <h2 className="font-semibold text-white">Guest features</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle checked={f.ordering} onChange={(v) => set({ ordering: v })}>Order from the table</Toggle>
          <Toggle checked={f.waiterCall} onChange={(v) => set({ waiterCall: v })}>Call a waiter / ask for the bill</Toggle>
          <Toggle checked={f.booking} onChange={(v) => set({ booking: v })}>Table bookings</Toggle>
          <Toggle checked={f.active} onChange={(v) => set({ active: v })}>Menu is online</Toggle>
        </div>
        <p className="text-xs text-slate-500">Orders, calls and bookings arrive in the Live tab and as notifications. Bookings are also emailed to you.</p>
      </section>

      <section className={section}>
        <h2 className="font-semibold text-white">Contact & Wi-Fi</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {text('address', 'Address', 'Rua das Oliveiras 45, Porto')}
          {text('phone', 'Phone', '+351 220 000 000', 'tel')}
          {text('whatsapp', 'WhatsApp', '+351 910 000 000', 'tel')}
          {text('email', 'Email', 'hello@restaurant.com', 'email')}
          {text('instagram', 'Instagram', '@restaurant')}
          {text('website', 'Website', 'https://')}
          {text('wifiName', 'Wi-Fi network')}
          {text('wifiPassword', 'Wi-Fi password')}
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0d0b18]/95 p-3 backdrop-blur">
        <button type="button" onClick={onDelete} className="flex items-center gap-1.5 px-2 text-sm text-slate-400 hover:text-rose-300"><Trash2 className="h-4 w-4" />Delete restaurant</button>
        <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>Save details</Button>
      </div>
    </form>
  );
}
