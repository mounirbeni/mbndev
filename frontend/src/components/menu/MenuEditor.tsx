'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  ArrowDown, ArrowUp, Copy, ImagePlus, Languages, Loader2, Pencil, Plus, Save, Trash2, X, Eye, EyeOff, Flame,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { menuAPI, type MenuCategory, type MenuChoice, type MenuItem, type MenuLang, type MenuRestaurant } from '@/lib/api';
import { ALLERGENS, MENU_LANGS, formatMoney, photoUrl } from '@/lib/menu';
import { resizePhoto } from './photo';
import { LocalizedField, Toggle, errMsg, fieldCls, labelCls, newId } from './ui';

const blankItem = (): MenuItem => ({
  id: newId(), name: {}, desc: {}, price: 0, photo: null, allergens: [], veg: false, vegan: false, spicy: 0,
  chef: false, isNew: false, available: true, kcal: null, options: [], extras: [],
});
const move = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
};
const missingIn = (r: MenuRestaurant, from: MenuLang, to: MenuLang) => {
  let n = 0;
  const check = (o: Record<string, string | undefined>) => { if (o[from] && !o[to]) n++; };
  check(r.tagline); check(r.about);
  for (const c of r.menu.categories) {
    check(c.name);
    for (const it of c.items) { check(it.name); check(it.desc); it.options.forEach((o) => check(o.name)); it.extras.forEach((e) => check(e.name)); }
  }
  return n;
};

export default function MenuEditor({ restaurant, onSaved }: { restaurant: MenuRestaurant; onSaved: (r: MenuRestaurant) => void }) {
  const [cats, setCats] = useState<MenuCategory[]>(restaurant.menu.categories);
  const [lang, setLang] = useState<MenuLang>(restaurant.defaultLanguage);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<{ cat: number; item: MenuItem; isNew: boolean } | null>(null);
  const [translating, setTranslating] = useState<string | null>(null);
  const fallback = restaurant.defaultLanguage;
  const money = (n: number) => formatMoney(n, restaurant.currency, 'en');

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (next: MenuCategory[]) => { setCats(next); setDirty(true); };
  const setCat = (i: number, patch: Partial<MenuCategory>) => update(cats.map((c, k) => (k === i ? { ...c, ...patch } : c)));

  const save = async (next = cats) => {
    setSaving(true);
    try {
      const { data } = await menuAPI.updateRestaurant(restaurant.id, { menu: { categories: next } });
      setCats(data.restaurant.menu.categories);
      setDirty(false);
      onSaved(data.restaurant);
      toast.success('Menu saved — guests see it now');
      return data.restaurant as MenuRestaurant;
    } catch (err) {
      toast.error(errMsg(err, 'Could not save the menu.'));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const translateAll = async () => {
    let current: MenuRestaurant | null = restaurant;
    if (dirty) current = await save();
    if (!current) return;
    const targets = current.languages.filter((l) => l !== fallback && missingIn(current!, fallback, l) > 0);
    if (!targets.length) { toast.success('Everything is already translated.'); return; }
    try {
      for (const to of targets) {
        let remaining = 1;
        while (remaining > 0) {
          setTranslating(`${MENU_LANGS.find((l) => l.id === to)?.label}…`);
          const { data } = await menuAPI.translate(restaurant.id, fallback, to);
          current = data.restaurant as MenuRestaurant;
          remaining = data.remaining;
          setCats(current.menu.categories);
          onSaved(current);
        }
      }
      toast.success('Translated — check a few dishes in each language.');
    } catch (err) {
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      toast.error(code === 'NO_KEY' ? 'Add your OpenAI key in Settings first.' : errMsg(err, 'Translation failed.'));
    } finally {
      setTranslating(null);
    }
  };

  const saveItem = (cat: number, item: MenuItem, isNew: boolean) => {
    const next = cats.map((c, k) => (k !== cat ? c : { ...c, items: isNew ? [...c.items, item] : c.items.map((x) => (x.id === item.id ? item : x)) }));
    setEditing(null);
    setCats(next);
    save(next);
  };

  const totalDishes = cats.reduce((n, c) => n + c.items.length, 0);

  return (
    <div>
      <div className="sticky top-[57px] z-20 -mx-4 mb-5 flex flex-wrap items-center gap-2 border-b border-white/[0.06] bg-[#07060f]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <span className="text-xs text-slate-400">Editing</span>
        <div className="flex flex-wrap gap-1">
          {restaurant.languages.map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold ${lang === l ? 'bg-violet-500 text-white' : 'bg-white/[0.05] text-slate-300 hover:bg-white/10'}`}>
              {l.toUpperCase()}{l === fallback ? ' ★' : ''}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {restaurant.languages.length > 1 && (
            <Button variant="secondary" size="sm" onClick={translateAll} disabled={!!translating} icon={translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}>
              {translating ? `Translating ${translating}` : 'Translate with AI'}
            </Button>
          )}
          <Button size="sm" onClick={() => save()} loading={saving} disabled={!dirty} icon={<Save className="h-4 w-4" />}>{dirty ? 'Save menu' : 'Saved'}</Button>
        </div>
      </div>

      {cats.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
          Start with a category such as “Starters”, then add its dishes.
        </div>
      )}

      <div className="space-y-5">
        {cats.map((c, ci) => (
          <section key={c.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-0 flex-1">
                <LocalizedField label="Category" value={c.name} lang={lang} fallback={fallback} maxLength={60} onChange={(name) => setCat(ci, { name })} />
              </div>
              <div className="flex gap-1">
                <IconBtn label="Move up" onClick={() => update(move(cats, ci, ci - 1))} disabled={ci === 0}><ArrowUp /></IconBtn>
                <IconBtn label="Move down" onClick={() => update(move(cats, ci, ci + 1))} disabled={ci === cats.length - 1}><ArrowDown /></IconBtn>
                <IconBtn label="Delete category" danger onClick={() => { if (window.confirm(`Delete this category and its ${c.items.length} dishes?`)) update(cats.filter((_, k) => k !== ci)); }}><Trash2 /></IconBtn>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-white/[0.05]">
              {c.items.map((it, ii) => (
                <li key={it.id} className={`flex items-center gap-3 py-2.5 ${it.available ? '' : 'opacity-50'}`}>
                  {it.photo
                    // eslint-disable-next-line @next/next/no-img-element -- our own resized photo
                    ? <img src={photoUrl(it.photo)!} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-600"><ImagePlus className="h-4 w-4" /></span>}
                  <button className="min-w-0 flex-1 text-left" onClick={() => setEditing({ cat: ci, item: it, isNew: false })}>
                    <p className="truncate font-medium text-white">{it.name[lang] || <span className="text-amber-300/80">{it.name[fallback] || 'Untitled'} · not translated</span>}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">{money(it.price)}</span>
                      {it.allergens.length > 0 && <span>Allergens {it.allergens.join(', ')}</span>}
                      {it.vegan ? <span className="text-emerald-300">Vegan</span> : it.veg ? <span className="text-emerald-300">Vegetarian</span> : null}
                      {it.spicy > 0 && <span className="flex items-center text-rose-300"><Flame className="h-3 w-3" />{it.spicy}</span>}
                      {it.chef && <span className="text-amber-300">★ Chef</span>}
                      {!it.available && <span className="text-rose-300">Sold out</span>}
                    </p>
                  </button>
                  <div className="flex shrink-0 gap-1">
                    <IconBtn label={it.available ? 'Mark sold out' : 'Mark available'} onClick={() => setCat(ci, { items: c.items.map((x) => (x.id === it.id ? { ...x, available: !x.available } : x)) })}>{it.available ? <Eye /> : <EyeOff />}</IconBtn>
                    <IconBtn label="Edit" onClick={() => setEditing({ cat: ci, item: it, isNew: false })}><Pencil /></IconBtn>
                    <span className="hidden gap-1 sm:flex">
                      <IconBtn label="Move up" onClick={() => setCat(ci, { items: move(c.items, ii, ii - 1) })} disabled={ii === 0}><ArrowUp /></IconBtn>
                      <IconBtn label="Move down" onClick={() => setCat(ci, { items: move(c.items, ii, ii + 1) })} disabled={ii === c.items.length - 1}><ArrowDown /></IconBtn>
                      <IconBtn label="Duplicate" onClick={() => setCat(ci, { items: [...c.items.slice(0, ii + 1), { ...it, id: newId(), photo: it.photo }, ...c.items.slice(ii + 1)] })}><Copy /></IconBtn>
                    </span>
                    <IconBtn label="Delete" danger onClick={() => { if (window.confirm('Delete this dish?')) setCat(ci, { items: c.items.filter((x) => x.id !== it.id) }); }}><Trash2 /></IconBtn>
                  </div>
                </li>
              ))}
            </ul>
            <button onClick={() => setEditing({ cat: ci, item: blankItem(), isNew: true })} className="mt-3 flex items-center gap-1.5 rounded-xl border border-dashed border-white/15 px-3 py-2 text-sm text-slate-300 hover:border-violet-400/50 hover:text-white">
              <Plus className="h-4 w-4" /> Add dish
            </button>
          </section>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={() => update([...cats, { id: newId(), name: {}, items: [] }])} icon={<Plus className="h-4 w-4" />}>Add category</Button>
        <span className="text-xs text-slate-500">{cats.length} categories · {totalDishes} dishes · up to 400 dishes</span>
      </div>

      {editing && (
        <DishModal restaurant={restaurant} initial={editing.item} lang={lang} fallback={fallback} isNew={editing.isNew}
          onCancel={() => setEditing(null)} onSave={(item) => saveItem(editing.cat, item, editing.isNew)} />
      )}
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 disabled:opacity-30 [&>svg]:h-4 [&>svg]:w-4 ${danger ? 'hover:text-rose-300' : 'hover:text-white'}`}>
      {children}
    </button>
  );
}

function DishModal({ restaurant, initial, lang, fallback, isNew, onCancel, onSave }: {
  restaurant: MenuRestaurant; initial: MenuItem; lang: MenuLang; fallback: MenuLang; isNew: boolean;
  onCancel: () => void; onSave: (item: MenuItem) => void;
}) {
  const [it, setIt] = useState<MenuItem>(initial);
  const [editLang, setEditLang] = useState<MenuLang>(lang);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<MenuItem>) => setIt((x) => ({ ...x, ...patch }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onCancel]);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await resizePhoto(file);
      const res = await menuAPI.uploadPhoto(restaurant.id, data);
      set({ photo: res.data.id });
    } catch (err) {
      toast.error(err instanceof Error && !('response' in err) ? err.message : errMsg(err, 'Could not upload the photo.'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!it.name[fallback]) { toast.error(`Give the dish a name in ${fallback.toUpperCase()} (the main language).`); setEditLang(fallback); return; }
    onSave({ ...it, veg: it.veg || it.vegan });
  };

  const choiceList = (key: 'options' | 'extras', title: string, help: string) => (
    <div>
      <p className={labelCls}>{title}</p>
      <p className="mt-1 text-xs text-slate-500">{help}</p>
      <div className="mt-2 space-y-2">
        {it[key].map((o, i) => (
          <div key={o.id} className="flex items-center gap-2">
            <input value={o.name[editLang] ?? ''} placeholder={o.name[fallback] ?? 'Name'} maxLength={60} dir={editLang === 'ar' ? 'rtl' : 'ltr'}
              onChange={(e) => set({ [key]: it[key].map((x, k) => (k === i ? { ...x, name: { ...x.name, [editLang]: e.target.value } } : x)) } as Partial<MenuItem>)}
              className={`${fieldCls} flex-1`} aria-label={`${title} name`} />
            <input type="number" step="0.1" value={o.price} aria-label="Price change"
              onChange={(e) => set({ [key]: it[key].map((x, k) => (k === i ? { ...x, price: Number(e.target.value) } : x)) } as Partial<MenuItem>)}
              className={`${fieldCls} w-24`} />
            <IconBtn label="Remove" danger onClick={() => set({ [key]: it[key].filter((_, k) => k !== i) } as Partial<MenuItem>)}><X /></IconBtn>
          </div>
        ))}
      </div>
      {it[key].length < 10 && (
        <button type="button" onClick={() => set({ [key]: [...it[key], { id: newId(), name: {}, price: 0 } as MenuChoice] } as Partial<MenuItem>)}
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-white"><Plus className="h-3.5 w-3.5" />Add</button>
      )}
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6" onClick={onCancel}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0d0b18] sm:rounded-3xl">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
          <h2 className="flex-1 text-lg font-semibold text-white">{isNew ? 'New dish' : 'Edit dish'}</h2>
          <div className="flex gap-1">
            {restaurant.languages.map((l) => (
              <button type="button" key={l} onClick={() => setEditLang(l)} className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold ${editLang === l ? 'bg-violet-500 text-white' : 'bg-white/[0.05] text-slate-400'}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <IconBtn label="Close" onClick={onCancel}><X /></IconBtn>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="flex gap-4">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-slate-400 hover:border-violet-400/50">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" />
                // eslint-disable-next-line @next/next/no-img-element -- our own resized photo
                : it.photo ? <img src={photoUrl(it.photo)!} alt="" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-1 text-[11px]"><ImagePlus className="h-5 w-5" />Photo</span>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
            <div className="min-w-0 flex-1 space-y-3">
              <LocalizedField label="Name" value={it.name} lang={editLang} fallback={fallback} maxLength={80} required onChange={(name) => set({ name })} />
              <div className="flex flex-wrap items-end gap-3">
                <label className="block w-32"><span className={labelCls}>Price ({restaurant.currency})</span>
                  <input type="number" min={0} step="0.1" value={it.price} onChange={(e) => set({ price: Number(e.target.value) })} className={`${fieldCls} mt-1.5`} required /></label>
                <label className="block w-28"><span className={labelCls}>kcal</span>
                  <input type="number" min={0} value={it.kcal ?? ''} onChange={(e) => set({ kcal: e.target.value ? Number(e.target.value) : null })} className={`${fieldCls} mt-1.5`} /></label>
                {it.photo && <button type="button" onClick={() => set({ photo: null })} className="pb-2.5 text-xs text-slate-400 hover:text-rose-300">Remove photo</button>}
              </div>
            </div>
          </div>
          <LocalizedField label="Description" value={it.desc} lang={editLang} fallback={fallback} maxLength={300} multiline onChange={(desc) => set({ desc })} />

          <div>
            <p className={labelCls}>Allergens (EU 1169/2011)</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(ALLERGENS).map(([n, names]) => {
                const on = it.allergens.includes(Number(n));
                return (
                  <button type="button" key={n} onClick={() => set({ allergens: on ? it.allergens.filter((a) => a !== Number(n)) : [...it.allergens, Number(n)].sort((a, b) => a - b) })}
                    className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs ${on ? 'border-rose-400/60 bg-rose-500/20 text-rose-100' : 'border-white/10 text-slate-300 hover:border-white/25'}`}>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${on ? 'bg-rose-500 text-white' : 'bg-white/10'}`}>{n}</span>{names.en}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle checked={it.veg || it.vegan} onChange={(v) => set({ veg: v, vegan: v ? it.vegan : false })}>Vegetarian</Toggle>
            <Toggle checked={it.vegan} onChange={(v) => set({ vegan: v, veg: v || it.veg })}>Vegan</Toggle>
            <Toggle checked={it.chef} onChange={(v) => set({ chef: v })}>★ Chef&apos;s pick (shown at the top)</Toggle>
            <Toggle checked={it.isNew} onChange={(v) => set({ isNew: v })}>“New” badge</Toggle>
            <Toggle checked={it.available} onChange={(v) => set({ available: v })}>Available today</Toggle>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-sm text-slate-200">
              <span>Spicy</span>
              <span className="flex gap-1">{[0, 1, 2, 3].map((n) => (
                <button type="button" key={n} onClick={() => set({ spicy: n })} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold ${it.spicy === n ? 'bg-rose-500 text-white' : 'bg-white/[0.05] text-slate-300'}`}>{n === 0 ? 'No' : '🌶'.repeat(n)}</button>
              ))}</span>
            </label>
          </div>

          {choiceList('options', 'Choices (guest picks one)', 'e.g. Chicken / Tofu −1 / Prawns +2.5, or Glass / Bottle +14. The price is added to the dish price.')}
          {choiceList('extras', 'Extras (guest can tick several)', 'e.g. Extra cheese +1.5, Fried egg +1.')}
        </div>

        <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={uploading}>{isNew ? 'Add & save' : 'Save dish'}</Button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

