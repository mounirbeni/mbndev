'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Search, X, SlidersHorizontal, Globe, Moon, Sun, BookOpen, CalendarDays, Info, ShoppingBag, Check, Phone, MapPin,
  Instagram, Wifi, Mail, Globe2, MessageCircle, Loader2, BellRing, Receipt,
} from 'lucide-react';
import type { MenuItem, MenuLang, MenuRestaurant } from '@/lib/api';
import {
  ALLERGENS, MENU_COPY, MENU_LANGS, formatMoney, hhmm, loc, localeOf, openState, paymentLabel, photoUrl, slotsFor, zonedNow, type MenuCopy,
} from '@/lib/menu';
import s from './publicMenu.module.css';

type View = 'menu' | 'book' | 'info' | 'order';
type Quick = 'veg' | 'vegan' | 'gf' | 'mild';
interface CartLine { key: string; itemId: string; optionId: string | null; extraIds: string[]; qty: number; note: string }
interface Tracked { id: string; kind: 'order' | 'booking' | 'waiter' | 'bill'; status: string; total?: number | null; at: number; label?: string }
type Sheet = { type: 'dish'; itemId: string } | { type: 'filters' } | { type: 'lang' } | { type: 'bill' } | null;

const FINAL = new Set(['done', 'cancelled', 'confirmed', 'declined']);
const store = {
  get<T>(k: string, f: T): T { try { const v = localStorage.getItem(k); return v == null ? f : JSON.parse(v) as T; } catch { return f; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked — keep working in memory */ } },
};
/** Wall-clock time for request records (kept outside render). */
const stamp = () => Date.now();
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/** Readable text colour on top of the restaurant's colour. */
function inkOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? '#111827' : '#ffffff';
}

/* ─── dish illustration when there is no photo ─────────────────────────────── */
const FOOD = [['#e9a24a', '#d6452f'], ['#79a548', '#e04b36'], ['#f2b632', '#c0392b'], ['#c9853c', '#f0d9a6'], ['#b24a3a', '#efe2c4'], ['#d8c39a', '#6b4a2e'], ['#ef8a5b', '#7aa04a'], ['#f0cf6a', '#3d5a2a'], ['#6b4430', '#efe3cf'], ['#c9452f', '#e3a93a']];
function hash(str: string) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function Plate({ id, drink, className }: { id: string; drink?: boolean; className: string }) {
  let seed = hash(id);
  const r = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const [a, b] = FOOD[seed % FOOD.length];
  const g = `g${id}`;
  const bits = drink ? [] : Array.from({ length: 11 }, (_, k) => {
    const ang = r() * Math.PI * 2, rad = 4 + r() * 17, x = 40 + Math.cos(ang) * rad, y = 40 + Math.sin(ang) * rad;
    return k % 4 === 0
      ? <ellipse key={k} cx={x} cy={y} rx={2.4 + r() * 2.6} ry={1.1 + r() * 0.9} transform={`rotate(${Math.floor(r() * 180)} ${x} ${y})`} fill="#4d7d34" />
      : <circle key={k} cx={x} cy={y} r={1.4 + r() * 2.8} fill={b} />;
  });
  return (
    <svg className={className} viewBox="0 0 80 80" aria-hidden="true">
      <defs><radialGradient id={g} cx=".38" cy=".35" r=".75"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".25" stopColor={a} /><stop offset="1" stopColor={a} /></radialGradient></defs>
      <circle cx="40" cy="41.5" r="37" fill="#0e1a2b" opacity=".08" />
      <circle cx="40" cy="40" r="37" fill="#fbfcfe" stroke="#d7dfeb" />
      <circle cx="40" cy="40" r="30" fill="none" stroke="var(--accent)" strokeOpacity=".3" strokeWidth="1.2" strokeDasharray="2 3" />
      {drink
        ? <><path d="M30 22h20l-2.5 36a3 3 0 0 1-3 2.8h-9a3 3 0 0 1-3-2.8z" fill={`url(#${g})`} /><circle cx="47" cy="22" r="5" fill={b} /></>
        : <><circle cx="40" cy="40" r="24" fill={`url(#${g})`} />{bits}</>}
    </svg>
  );
}
function DishImage({ item, className, plateClass, drink }: { item: MenuItem; className: string; plateClass: string; drink?: boolean }) {
  const src = photoUrl(item.photo);
  // eslint-disable-next-line @next/next/no-img-element -- photos come from our own API, already resized
  return src ? <img src={src} alt="" className={className} loading="lazy" decoding="async" /> : <Plate id={item.id} drink={drink} className={plateClass} />;
}

const Chilis = ({ n, label }: { n: number; label: string }) => (n ? (
  <span className={s.chili} title={label} aria-label={`${label} ${n}/3`}>
    {Array.from({ length: n }, (_, i) => <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.5 3.2c.4-.6 1.3-.7 1.8-.1.4.4.4 1 .1 1.4l-.6.8c1.9.7 3.2 2.5 3.2 4.6 0 6.6-7.8 11.5-14.2 11.9-1 .1-1.5-1.2-.7-1.8 4.6-3.3 6.8-7.5 7.2-10.9.3-2.2 1.8-3.8 3.6-4.2z" /></svg>)}
  </span>
) : null);

function Tags({ item, t }: { item: MenuItem; t: MenuCopy }) {
  return <>
    {!item.available && <span className={cx(s.tag, s.tagOut)}>{t.soldOut}</span>}
    {item.chef && <span className={cx(s.tag, s.tagC)}>★ {t.chef}</span>}
    {item.isNew && <span className={cx(s.tag, s.tagN)}>{t.isNew}</span>}
    {item.vegan ? <span className={cx(s.tag, s.tagV)}>{t.vegan}</span> : item.veg ? <span className={cx(s.tag, s.tagV)}>{t.veg}</span> : null}
  </>;
}

/* ─── app ──────────────────────────────────────────────────────────────────── */
/**
 * The guest menu. With `demo`, it shows that restaurant without the API:
 * orders, calls and bookings are simulated (used on the product page).
 */
export default function PublicMenu({ id, demo }: { id: string; demo?: MenuRestaurant }) {
  const [data, setData] = useState<MenuRestaurant | null>(null);
  const [missing, setMissing] = useState(false);
  const [lang, setLang] = useState<MenuLang>('en');
  const [dark, setDark] = useState(false);
  const [view, setView] = useState<View>('menu');
  const [q, setQ] = useState('');
  const [quick, setQuick] = useState<Set<Quick>>(new Set());
  const [avoid, setAvoid] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartLine[]>([]);
  const [table, setTable] = useState('');
  const [tracked, setTracked] = useState<Tracked[]>([]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const k = (name: string) => `mbn_menu_${name}_${id}`;

  const say = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  }, []);

  /* load */
  useEffect(() => {
    (demo ? Promise.resolve({ restaurant: demo }) : fetch(`/api/menu/public/${encodeURIComponent(id)}`).then(async (r) => (r.ok ? r.json() : null)))
      .then((d) => {
        const r: MenuRestaurant | undefined = d?.restaurant;
        if (!r) { setMissing(true); return; }
        setData(r);
        const saved = store.get<MenuLang | null>(k('lang'), null);
        const browser = (typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : []).map((l) => l.slice(0, 2) as MenuLang);
        setLang(saved && r.languages.includes(saved) ? saved : browser.find((l) => r.languages.includes(l)) ?? r.defaultLanguage);
        setAvoid(new Set(store.get<number[]>('mbn_menu_avoid', [])));
        setCart(store.get<CartLine[]>(k('cart'), []));
        setTracked(store.get<Tracked[]>(k('tracked'), []).filter((x) => stamp() - x.at < 12 * 3600000));
        const fromUrl = new URLSearchParams(window.location.search).get('t') || (window.location.hash.match(/^#t(\w{1,6})$/) || [])[1];
        const tbl = (fromUrl || store.get(k('table'), '')).replace(/[^\p{L}\p{N} -]/gu, '').slice(0, 12);
        setTable(tbl);
        if (fromUrl) store.set(k('table'), tbl);
        const hashView = window.location.hash.slice(1);
        if (hashView === 'book' && r.booking) setView('book');
        else if (hashView === 'info') setView('info');
        if (!demo) try {
          if (!sessionStorage.getItem(k('view'))) {
            sessionStorage.setItem(k('view'), '1');
            fetch(`/api/menu/public/${encodeURIComponent(id)}/view`, { method: 'POST', keepalive: true }).catch(() => {});
          }
        } catch { /* storage blocked — skip the view count */ }
        if (!demo) document.title = r.name;
      })
      .catch(() => setMissing(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per restaurant id
  }, [id]);

  useEffect(() => {
    const saved = store.get<'light' | 'dark' | null>('mbn_menu_theme', null);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setDark(saved ? saved === 'dark' : mq.matches);
    if (saved) return;
    const on = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => { if (data) store.set(k('cart'), cart); }, [cart, data]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (data) store.set(k('tracked'), tracked); }, [tracked, data]); // eslint-disable-line react-hooks/exhaustive-deps

  /* follow open requests until they are final */
  const openIds = tracked.filter((x) => !FINAL.has(x.status) && (x.kind === 'order' || x.kind === 'booking')).map((x) => x.id).join(',');
  useEffect(() => {
    if (!openIds) return;
    if (demo) {
      const DEMO_FLOW: Record<string, [number, string][]> = { order: [[24, 'done'], [14, 'ready'], [6, 'preparing']], booking: [[6, 'confirmed']] };
      const timer = setInterval(() => setTracked((list) => list.map((x) => {
        const next = DEMO_FLOW[x.kind]?.find(([sec]) => (stamp() - x.at) / 1000 >= sec);
        return next && next[1] !== x.status ? { ...x, status: next[1] } : x;
      })), 1000);
      return () => clearInterval(timer);
    }
    const poll = () => openIds.split(',').forEach((rid) => {
      fetch(`/api/menu/public/${encodeURIComponent(id)}/requests/${encodeURIComponent(rid)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d?.request) setTracked((list) => list.map((x) => (x.id === rid ? { ...x, status: d.request.status } : x))); })
        .catch(() => {});
    });
    poll();
    const timer = setInterval(poll, 8000);
    return () => clearInterval(timer);
  }, [openIds, id, demo]);

  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 60000); return () => clearInterval(t); }, []);

  const items = useMemo(() => {
    const map = new Map<string, { item: MenuItem; drink: boolean }>();
    data?.menu.categories.forEach((c) => c.items.forEach((it) => map.set(it.id, { item: it, drink: /drink|bebid|boisson|bevand|getr|مشروب/i.test(Object.values(c.name).join(' ')) })));
    return map;
  }, [data]);

  if (missing) return <main className={cx(s.root, s.center)}>This menu is not available.</main>;
  if (!data) return <main className={cx(s.root, s.center)}><Loader2 className="h-6 w-6 animate-spin" /></main>;

  const t = MENU_COPY[lang] ?? MENU_COPY.en;
  const L = (v: Parameters<typeof loc>[0]) => loc(v, lang, data.defaultLanguage);
  const money = (n: number) => formatMoney(n, data.currency, lang);
  const accentStyle = { '--accent': data.color, '--accent-ink': inkOn(data.color) } as CSSProperties;
  const st = openState(data.hours, data.timezone, t);
  const canOrder = data.ordering;
  const tabs: { id: View; label: string; icon: ReactNode }[] = [
    { id: 'menu', label: t.navMenu, icon: <BookOpen /> },
    ...(data.booking ? [{ id: 'book' as View, label: t.navBook, icon: <CalendarDays /> }] : []),
    { id: 'info', label: t.navInfo, icon: <Info /> },
    ...(data.ordering || data.waiterCall ? [{ id: 'order' as View, label: t.navOrder, icon: <ShoppingBag /> }] : []),
  ];
  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const unitOf = (l: CartLine) => {
    const it = items.get(l.itemId)?.item;
    if (!it) return 0;
    const opt = it.options.find((o) => o.id === l.optionId) ?? it.options[0];
    return it.price + (opt?.price ?? 0) + it.extras.filter((e) => l.extraIds.includes(e.id)).reduce((n, e) => n + e.price, 0);
  };

  const go = (v: View) => {
    setView(v);
    setSheet(null);
    const hero = document.getElementById('mbn-hero');
    window.scrollTo(0, v === 'menu' ? 0 : hero?.offsetHeight ?? 0);
  };
  const chooseLang = (l: MenuLang) => { setLang(l); store.set(k('lang'), l); setSheet(null); };
  const toggleTheme = () => setDark((d) => { store.set('mbn_menu_theme', d ? 'light' : 'dark'); return !d; });
  const saveTable = (v: string) => { const clean = v.replace(/[^\p{L}\p{N} -]/gu, '').slice(0, 12); setTable(clean); store.set(k('table'), clean); };

  async function send(body: Record<string, unknown>) {
    if (demo) {
      await new Promise((r) => setTimeout(r, 450));
      return { id: `demo-${stamp()}`, kind: body.kind as Tracked['kind'], status: 'new', total: undefined as number | undefined };
    }
    const res = await fetch(`/api/menu/public/${encodeURIComponent(id)}/requests`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, language: lang }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.message || t.error);
    return d.request as { id: string; kind: Tracked['kind']; status: string; total?: number };
  }

  return (
    <main className={cx(s.root, dark && s.dark)} style={accentStyle} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <header id="mbn-hero" className={cx(s.hero, data.coverPhotoId && s.photo)}>
        {data.coverPhotoId
          // eslint-disable-next-line @next/next/no-img-element -- our own resized photo
          ? <><img src={photoUrl(data.coverPhotoId)!} alt="" className={s.heroBg} /><div className={s.heroShade} /></>
          : <div className={s.heroPattern} />}
        <div className={cx(s.wrap, s.heroIn)}>
          <div className={s.heroTop}>
            {data.logoPhotoId
              // eslint-disable-next-line @next/next/no-img-element -- our own resized photo
              ? <img src={photoUrl(data.logoPhotoId)!} alt="" className={s.logo} />
              : <span className={s.logoLetter} aria-hidden="true">{data.name.trim().charAt(0).toUpperCase()}</span>}
            <div className={s.tools}>
              {data.languages.length > 1 && (
                <button className={s.pill} onClick={() => setSheet({ type: 'lang' })} aria-label={t.language}><Globe />{lang.toUpperCase()}</button>
              )}
              <button className={s.pill} onClick={toggleTheme} aria-label={dark ? 'Light mode' : 'Dark mode'}>{dark ? <Sun /> : <Moon />}</button>
            </div>
          </div>
          <h1>{data.name}</h1>
          {L(data.tagline) && <p className={s.sub}>{L(data.tagline)}</p>}
          <div className={s.chips}>
            {st && <span className={s.chip}><span className={cx(s.dot, !st.open && s.dotOff)} />{st.text}</span>}
            {table && <span className={s.chip}>{t.table} {table}</span>}
          </div>
        </div>
      </header>

      {view === 'menu' && (
        <MenuView data={data} t={t} lang={lang} L={L} money={money} q={q} setQ={setQ} quick={quick} setQuick={setQuick} avoid={avoid}
          items={items} openDish={(itemId) => setSheet({ type: 'dish', itemId })} openFilters={() => setSheet({ type: 'filters' })} />
      )}
      {view === 'book' && (
        <BookView data={data} t={t} lang={lang} send={send} tracked={tracked.filter((x) => x.kind === 'booking')}
          onBooked={(x) => setTracked((list) => [x, ...list])} />
      )}
      {view === 'info' && <InfoView data={data} t={t} L={L} lang={lang} say={say} />}
      {view === 'order' && (
        <div className={cx(s.wrap, s.main)}>
          <div className={s.pageHead}><h2>{t.odTitle}</h2><p>{t.odSub}</p></div>
          <OrderView data={data} t={t} L={L} money={money} cart={cart} setCart={setCart} unitOf={unitOf} items={items}
            table={table} saveTable={saveTable} canOrder={canOrder} tracked={tracked.filter((x) => x.kind === 'order')}
            say={say} send={send} onSent={(x) => setTracked((list) => [x, ...list])} browse={() => go('menu')}
            askBill={() => setSheet({ type: 'bill' })} />
        </div>
      )}

      <nav className={s.tabbar} aria-label="Sections">
        <div className={cx(s.wrap, s.tabbarIn)}>
          {tabs.map((tab) => (
            <button key={tab.id} className={s.tab} aria-current={view === tab.id ? 'page' : undefined} onClick={() => go(tab.id)}>
              {tab.icon}<span>{tab.label}</span>
              {tab.id === 'order' && cartCount > 0 && <span className={cx(s.badge, s.num)}>{cartCount}</span>}
            </button>
          ))}
        </div>
      </nav>

      <div className={cx(s.scrim, sheet && s.scrimOpen)} onClick={() => setSheet(null)} />
      <div className={cx(s.sheet, sheet && s.sheetOpen)} role="dialog" aria-modal="true" aria-hidden={!sheet}>
        <div className={s.grab} />
        <button className={s.x} onClick={() => setSheet(null)} aria-label="Close"><X /></button>
        {sheet?.type === 'dish' && items.get(sheet.itemId) && (
          <DishSheet key={sheet.itemId} item={items.get(sheet.itemId)!.item} drink={items.get(sheet.itemId)!.drink} t={t} lang={lang} L={L} money={money}
            canOrder={canOrder} onAdd={(line, name) => {
              setCart((c) => {
                const same = c.find((x) => x.key === line.key);
                return same ? c.map((x) => (x === same ? { ...x, qty: Math.min(20, x.qty + line.qty) } : x)) : [...c, line];
              });
              setSheet(null);
              say(`${t.added} · ${line.qty}× ${name}`);
            }} />
        )}
        {sheet?.type === 'filters' && (
          <FiltersSheet t={t} lang={lang} quick={quick} setQuick={setQuick} avoid={avoid}
            setAvoid={(a) => { setAvoid(a); store.set('mbn_menu_avoid', [...a]); }}
            count={data.menu.categories.reduce((n, c) => n + c.items.filter((it) => visible(it, q, quick, avoid)).length, 0)}
            close={() => setSheet(null)} />
        )}
        {sheet?.type === 'lang' && (
          <>
            <h3>{t.language}</h3>
            <div className={s.opts} style={{ marginTop: 14 }}>
              {MENU_LANGS.filter((l) => data.languages.includes(l.id)).map((l) => (
                <label key={l.id} className={s.opt}><input type="radio" name="lang" checked={l.id === lang} onChange={() => chooseLang(l.id)} /><span className={s.optL}>{l.native}</span><span className={s.optD}>{l.id.toUpperCase()}</span></label>
              ))}
            </div>
          </>
        )}
        {sheet?.type === 'bill' && (
          <BillSheet data={data} t={t} onSend={async (payment) => {
            try {
              const r = await send({ kind: 'bill', table, payment });
              setTracked((list) => [{ id: r.id, kind: 'bill', status: r.status, at: stamp() }, ...list]);
              setSheet(null); say(t.billOk);
            } catch (e) { say((e as Error).message); }
          }} />
        )}
      </div>
      <div className={cx(s.toast, toast && s.toastShow)} role="status" aria-live="polite">{toast}</div>
    </main>
  );
}

function visible(it: MenuItem, q: string, quick: Set<Quick>, avoid: Set<number>, names: string[] = []) {
  if (quick.has('veg') && !it.veg && !it.vegan) return false;
  if (quick.has('vegan') && !it.vegan) return false;
  if (quick.has('gf') && it.allergens.includes(1)) return false;
  if (quick.has('mild') && it.spicy > 0) return false;
  if (it.allergens.some((n) => avoid.has(n))) return false;
  if (q) {
    const fold = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const hay = fold([...Object.values(it.name), ...Object.values(it.desc), ...names].join(' '));
    if (!fold(q).split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

type LFn = (v: Parameters<typeof loc>[0]) => string;

/* ─── menu ─────────────────────────────────────────────────────────────────── */
function MenuView({ data, t, lang, L, money, q, setQ, quick, setQuick, avoid, items, openDish, openFilters }: {
  data: MenuRestaurant; t: MenuCopy; lang: MenuLang; L: LFn; money: (n: number) => string; q: string; setQ: (v: string) => void;
  quick: Set<Quick>; setQuick: (v: Set<Quick>) => void; avoid: Set<number>; items: Map<string, { item: MenuItem; drink: boolean }>;
  openDish: (id: string) => void; openFilters: () => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const filtering = Boolean(q || quick.size || avoid.size);
  const cats = data.menu.categories.map((c) => ({ ...c, shown: c.items.filter((it) => visible(it, q, quick, avoid)) })).filter((c) => c.shown.length);
  const specials = filtering ? [] : data.menu.categories.flatMap((c) => c.items).filter((it) => it.chef && it.available).slice(0, 6);
  const catKey = cats.map((c) => c.id).join(',');

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.cat ?? null); }), { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('[data-cat]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [catKey]);
  useEffect(() => { if (active) document.querySelector(`[data-catbtn="${active}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest' }); }, [active]);

  const toggle = (k: Quick) => { const n = new Set(quick); if (n.has(k)) n.delete(k); else n.add(k); setQuick(n); };
  const minPrice = (it: MenuItem) => it.price + (it.options.length ? Math.min(...it.options.map((o) => o.price)) : 0);

  return (
    <section>
      <div className={s.bar}>
        <div className={s.wrap}>
          <div className={s.searchRow}>
            <label className={s.search}>
              <Search aria-hidden="true" />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.search} autoComplete="off" />
              {q && <button className={s.clearBtn} onClick={() => setQ('')} aria-label="Clear"><X className="h-3 w-3" /></button>}
            </label>
            <button className={s.fbtn} onClick={openFilters}><SlidersHorizontal />{t.filters}{avoid.size > 0 && <span className={s.badge}>{avoid.size}</span>}</button>
          </div>
          <div className={s.rail}>
            {(['veg', 'vegan', 'gf', 'mild'] as Quick[]).map((k) => <button key={k} className={s.quick} aria-pressed={quick.has(k)} onClick={() => toggle(k)}>{t[k]}</button>)}
          </div>
          {cats.length > 1 && (
            <nav className={s.rail} style={{ paddingTop: 0 }}>
              {cats.map((c, i) => (
                <button key={c.id} data-catbtn={c.id} className={cx(s.catBtn, (active ? active === c.id : i === 0) && s.catOn)}
                  onClick={() => document.getElementById(`c-${c.id}`)?.scrollIntoView({ behavior: 'smooth' })}>{L(c.name)}</button>
              ))}
            </nav>
          )}
        </div>
      </div>
      <div className={cx(s.wrap, s.main)}>
        {specials.length > 0 && (
          <div className={s.sect}>
            <h2>{t.specials}</h2>
            <div className={s.specials}>
              {specials.map((it) => (
                <button key={it.id} className={s.sp} onClick={() => openDish(it.id)}>
                  <div style={{ minWidth: 0 }}><div className={s.spK}>★ {t.chef}</div><div className={s.spT}>{L(it.name)}</div><div className={cx(s.price, s.num)}>{money(minPrice(it))}</div></div>
                  <DishImage item={it} drink={items.get(it.id)?.drink} className={s.thumb} plateClass={s.plate} />
                </button>
              ))}
            </div>
          </div>
        )}
        {cats.map((c) => (
          <div key={c.id} id={`c-${c.id}`} data-cat={c.id} className={s.sect}>
            <h2>{L(c.name)}</h2>
            <div className={s.list}>
              {c.shown.map((it) => {
                const mp = minPrice(it);
                return (
                  <button key={it.id} className={cx(s.dish, !it.available && s.dishOff)} onClick={() => openDish(it.id)}>
                    <div style={{ minWidth: 0 }}>
                      <div className={s.dishName}>{L(it.name)} <Chilis n={it.spicy} label={t.spicy} /></div>
                      {L(it.desc) && <div className={s.dishDesc}>{L(it.desc)}</div>}
                      <div className={s.meta}>
                        <span className={cx(s.price, s.num)}>{mp !== it.price ? `${t.from} ` : ''}{money(mp)}</span>
                        <Tags item={it} t={t} />
                        {it.allergens.length > 0 && <span className={s.als}>{it.allergens.map((n) => <span key={n} className={s.al} title={ALLERGENS[n]?.[lang]}>{n}</span>)}</span>}
                      </div>
                    </div>
                    <DishImage item={it} drink={items.get(it.id)?.drink} className={s.thumb} plateClass={s.plate} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {!cats.length && <p className={s.empty}>{data.menu.categories.length ? t.empty : '—'}</p>}
        {data.branding !== false && <p className={s.foot}><a href="https://mbndev.ma/products/menu" target="_blank" rel="noopener noreferrer">{t.poweredBy}</a></p>}
      </div>
    </section>
  );
}

/* ─── dish sheet ───────────────────────────────────────────────────────────── */
function DishSheet({ item, drink, t, lang, L, money, canOrder, onAdd }: {
  item: MenuItem; drink: boolean; t: MenuCopy; lang: MenuLang; L: LFn; money: (n: number) => string; canOrder: boolean;
  onAdd: (line: CartLine, name: string) => void;
}) {
  const [opt, setOpt] = useState(item.options[0]?.id ?? null);
  const [extras, setExtras] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const option = item.options.find((o) => o.id === opt);
  const unit = item.price + (option?.price ?? 0) + item.extras.filter((e) => extras.includes(e.id)).reduce((n, e) => n + e.price, 0);

  return (
    <div>
      {item.photo
        // eslint-disable-next-line @next/next/no-img-element -- our own resized photo
        ? <img src={photoUrl(item.photo)!} alt="" className={s.sheetPhoto} />
        : <Plate id={item.id} drink={drink} className={s.sheetPlate} />}
      <h3>{L(item.name)} <Chilis n={item.spicy} label={t.spicy} /></h3>
      {L(item.desc) && <p className={s.lead}>{L(item.desc)}</p>}
      <div className={s.facts}><Tags item={item} t={t} />{item.kcal ? <span className={cx(s.tag, s.num)}>{item.kcal} kcal</span> : null}</div>

      {item.options.length > 0 && <>
        <h4>{t.choose}</h4>
        <div className={s.opts}>
          {item.options.map((o) => (
            <label key={o.id} className={s.opt}>
              <input type="radio" name="opt" checked={opt === o.id} onChange={() => setOpt(o.id)} />
              <span className={s.optL}>{L(o.name)}</span>
              <span className={cx(s.optD, s.num)}>{o.price ? `${o.price > 0 ? '+' : '−'}${money(Math.abs(o.price))}` : ''}</span>
            </label>
          ))}
        </div>
      </>}
      {item.extras.length > 0 && <>
        <h4>{t.extras}</h4>
        <div className={s.opts}>
          {item.extras.map((e) => (
            <label key={e.id} className={s.opt}>
              <input type="checkbox" checked={extras.includes(e.id)} onChange={(ev) => setExtras((x) => (ev.target.checked ? [...x, e.id] : x.filter((y) => y !== e.id)))} />
              <span className={s.optL}>{L(e.name)}</span>
              <span className={cx(s.optD, s.num)}>{e.price ? `+${money(e.price)}` : ''}</span>
            </label>
          ))}
        </div>
      </>}
      <h4>{t.allergens}</h4>
      <div className={s.alist}>
        {item.allergens.length
          ? item.allergens.map((n) => <span key={n}><span className={s.al}>{n}</span>{ALLERGENS[n]?.[lang]}</span>)
          : <span style={{ paddingInlineStart: 11 }}>{t.noAl}</span>}
      </div>
      {canOrder && item.available && <>
        {!drink && <><h4>{t.note}</h4><input className={s.in} value={note} maxLength={80} placeholder={t.notePh} onChange={(e) => setNote(e.target.value)} /></>}
        <div className={s.addBar}>
          <div className={s.stepper}>
            <button onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="−">−</button>
            <output className={s.num}>{qty}</output>
            <button onClick={() => setQty((n) => Math.min(20, n + 1))} aria-label="+">+</button>
          </div>
          <button className={cx(s.btn, s.primary, s.wide)} onClick={() => onAdd({
            key: [item.id, opt ?? '', [...extras].sort().join('+'), note.trim()].join('|'), itemId: item.id, optionId: opt, extraIds: extras, qty, note: note.trim(),
          }, L(item.name))}>
            <span>{t.add}</span><span className={s.num}>{money(unit * qty)}</span>
          </button>
        </div>
      </>}
    </div>
  );
}

/* ─── filters ──────────────────────────────────────────────────────────────── */
function FiltersSheet({ t, lang, quick, setQuick, avoid, setAvoid, count, close }: {
  t: MenuCopy; lang: MenuLang; quick: Set<Quick>; setQuick: (v: Set<Quick>) => void; avoid: Set<number>; setAvoid: (v: Set<number>) => void; count: number; close: () => void;
}) {
  return (
    <div>
      <h3>{t.filters}</h3>
      <h4>{t.diet}</h4>
      <div className={s.chipset}>
        {(['veg', 'vegan', 'gf', 'mild'] as Quick[]).map((k) => (
          <button key={k} className={s.plain} aria-pressed={quick.has(k)} onClick={() => { const n = new Set(quick); if (n.has(k)) n.delete(k); else n.add(k); setQuick(n); }}>{t[k]}</button>
        ))}
      </div>
      <h4>{t.avoid}</h4>
      <div className={s.chipset}>
        {Object.entries(ALLERGENS).map(([n, names]) => (
          <button key={n} aria-pressed={avoid.has(Number(n))} onClick={() => { const a = new Set(avoid); if (a.has(Number(n))) a.delete(Number(n)); else a.add(Number(n)); setAvoid(a); }}>
            <span className={s.al}>{n}</span>{names[lang]}
          </button>
        ))}
      </div>
      <div className={s.addBar}>
        <button className={cx(s.btn, s.ghost)} onClick={() => { setQuick(new Set()); setAvoid(new Set()); }}>{t.reset}</button>
        <button className={cx(s.btn, s.primary)} onClick={close}>{t.show} ({count})</button>
      </div>
    </div>
  );
}

/* ─── order ────────────────────────────────────────────────────────────────── */
function OrderView({ data, t, L, money, cart, setCart, unitOf, items, table, saveTable, canOrder, tracked, say, send, onSent, browse, askBill }: {
  data: MenuRestaurant; t: MenuCopy; L: LFn; money: (n: number) => string; cart: CartLine[]; setCart: (f: (c: CartLine[]) => CartLine[]) => void;
  unitOf: (l: CartLine) => number; items: Map<string, { item: MenuItem; drink: boolean }>; table: string; saveTable: (v: string) => void; canOrder: boolean;
  tracked: Tracked[]; say: (m: string) => void; send: (b: Record<string, unknown>) => Promise<{ id: string; kind: Tracked['kind']; status: string; total?: number }>;
  onSent: (x: Tracked) => void; browse: () => void; askBill: () => void;
}) {
  const [split, setSplit] = useState(1);
  const [sending, setSending] = useState(false);
  const tableRef = useRef<HTMLInputElement>(null);
  const lines = cart.filter((l) => items.has(l.itemId));
  const subtotal = lines.reduce((n, l) => n + unitOf(l) * l.qty, 0);
  const needTable = () => { tableRef.current?.focus(); say(t.needTable); };

  const sendOrder = async () => {
    if (!table) return needTable();
    setSending(true);
    try {
      const r = await send({ kind: 'order', table, items: lines.map((l) => ({ itemId: l.itemId, optionId: l.optionId, extraIds: l.extraIds, qty: l.qty, note: l.note })) });
      onSent({ id: r.id, kind: 'order', status: r.status, total: r.total ?? subtotal, at: stamp(), label: lines.map((l) => `${l.qty}× ${L(items.get(l.itemId)!.item.name)}`).join(', ') });
      setCart(() => []);
      window.scrollTo(0, document.getElementById('mbn-hero')?.offsetHeight ?? 0);
    } catch (e) { say((e as Error).message); } finally { setSending(false); }
  };
  const call = async () => {
    if (!table) return needTable();
    try { await send({ kind: 'waiter', table }); say(t.waiterOk); } catch (e) { say((e as Error).message); }
  };

  const steps = ['new', 'preparing', 'ready'];
  return (
    <div className={s.stack}>
      {tracked.slice(0, 3).map((o) => {
        const stage = o.status === 'done' ? 3 : Math.max(1, steps.indexOf(o.status) + 1);
        return (
          <div key={o.id} className={s.panel}>
            <p className={s.secHead} style={{ margin: 0 }}>{t.sentTitle}{o.total ? ` · ${money(o.total)}` : ''}</p>
            {o.label && <p className={s.small} style={{ margin: '6px 0 0' }}>{o.label}</p>}
            {o.status === 'cancelled'
              ? <p className={s.err} style={{ marginTop: 10 }}>{t.st_cancelled}</p>
              : <>
                <div className={s.track}>{[1, 2, 3].map((k) => <div key={k} className={cx(k <= stage && s.done)}><i /></div>)}</div>
                <div className={s.trackLbl}>{[t.st_new, t.st_preparing, o.status === 'done' ? t.st_done : t.st_ready].map((lbl, k) => <span key={k} className={cx(k < stage && s.trackOn)}>{lbl}</span>)}</div>
              </>}
          </div>
        );
      })}

      {canOrder && (lines.length ? (
        <div className={s.panel}>
          {lines.map((l) => {
            const it = items.get(l.itemId)!.item;
            const opt = it.options.find((o) => o.id === l.optionId);
            const sub = [opt && L(opt.name), ...it.extras.filter((e) => l.extraIds.includes(e.id)).map((e) => L(e.name)), l.note && `“${l.note}”`].filter(Boolean).join(' · ');
            return (
              <div key={l.key} className={s.line}>
                <div style={{ minWidth: 0 }}><div className={s.lineT}>{L(it.name)}</div><div className={s.lineS}>{sub ? `${sub} · ` : ''}<span className={s.num}>{money(unitOf(l))}</span></div></div>
                <div className={s.stepper}>
                  <button aria-label="−" onClick={() => setCart((c) => c.flatMap((x) => (x.key === l.key ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x])))}>−</button>
                  <output className={s.num}>{l.qty}</output>
                  <button aria-label="+" onClick={() => setCart((c) => c.map((x) => (x.key === l.key ? { ...x, qty: Math.min(20, x.qty + 1) } : x)))}>+</button>
                </div>
              </div>
            );
          })}
          <div className={cx(s.sum, s.num)}>
            <div className={s.big}><span>{t.total}</span><span>{money(subtotal)}</span></div>
            {data.coverCharge > 0 && <div className={s.small}><span>{t.cover}</span><span>{money(data.coverCharge)} / {t.perUnit}</span></div>}
          </div>
        </div>
      ) : !tracked.length && (
        <div className={s.panel} style={{ textAlign: 'center' }}>
          <p className={s.small} style={{ fontSize: 15 }}>{t.odEmpty}</p>
          <button className={cx(s.btn, s.primary)} onClick={browse}>{t.browse}</button>
        </div>
      ))}

      <div className={cx(s.panel, s.stack)}>
        <div className={s.grid2}>
          <label className={s.field}><span>{t.tableNo}</span><input ref={tableRef} className={cx(s.in, s.num)} value={table} maxLength={12} onChange={(e) => saveTable(e.target.value)} placeholder="12" /></label>
          {canOrder && lines.length > 0 && (
            <div className={s.field}><span>{t.split}</span>
              <div className={s.stepper}><button onClick={() => setSplit((n) => Math.max(1, n - 1))}>−</button><output className={s.num}>{split}</output><button onClick={() => setSplit((n) => Math.min(20, n + 1))}>+</button></div>
            </div>
          )}
        </div>
        {split > 1 && lines.length > 0 && <p className={cx(s.small, s.num)} style={{ margin: 0 }}>{split} × {money(subtotal / split)} {t.each}</p>}
        {canOrder && lines.length > 0 && <>
          <button className={cx(s.btn, s.primary, s.wide)} onClick={sendOrder} disabled={sending}>
            <span>{sending ? t.sending : t.send}</span><span className={s.num}>{money(subtotal)}</span>
          </button>
          <button className={cx(s.btn, s.ghost)} onClick={() => setCart(() => [])}>{t.clear}</button>
        </>}
        {canOrder && !lines.length && tracked.length > 0 && <button className={cx(s.btn, s.primary)} onClick={browse}>{t.addMore}</button>}
        {data.waiterCall && (
          <div className={s.actions2}>
            <button className={cx(s.btn, s.dark)} onClick={call}><BellRing className="h-4 w-4" />{t.waiter}</button>
            <button className={cx(s.btn, s.dark)} onClick={() => (table ? askBill() : needTable())}><Receipt className="h-4 w-4" />{t.bill}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function BillSheet({ data, t, onSend }: { data: MenuRestaurant; t: MenuCopy; onSend: (payment: string) => Promise<void> }) {
  const options = data.payments.length ? data.payments : ['card', 'cash'];
  const [pick, setPick] = useState(options[0]);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <h3>{t.payHow}</h3>
      <div className={s.seg} style={{ marginTop: 16, gridTemplateColumns: `repeat(${Math.min(3, options.length)}, 1fr)` }}>
        {options.map((p) => <button key={p} aria-pressed={pick === p} onClick={() => setPick(p)}>{paymentLabel(p, t)}</button>)}
      </div>
      <div className={s.addBar}>
        <button className={cx(s.btn, s.primary)} disabled={busy} onClick={async () => { setBusy(true); await onSend(pick); setBusy(false); }}>{t.bill}</button>
      </div>
    </div>
  );
}

/* ─── booking ──────────────────────────────────────────────────────────────── */
function BookView({ data, t, lang, send, tracked, onBooked }: {
  data: MenuRestaurant; t: MenuCopy; lang: MenuLang; send: (b: Record<string, unknown>) => Promise<{ id: string; kind: Tracked['kind']; status: string }>;
  tracked: Tracked[]; onBooked: (x: Tracked) => void;
}) {
  const now = zonedNow(data.timezone);
  const firstOpen = () => {
    for (let k = 0; k < 14; k++) {
      const d = new Date(`${now.date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + k);
      const iso = d.toISOString().slice(0, 10);
      const slots = slotsFor(data.hours, d.getUTCDay()).filter((m) => k > 0 || m > now.minutes + 30);
      if (slots.length) return iso;
    }
    return now.date;
  };
  const [date, setDate] = useState(firstOpen);
  const [time, setTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [terrace, setTerrace] = useState(false);
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Tracked | null>(null);

  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const slots = slotsFor(data.hours, weekday).filter((m) => date !== now.date || m > now.minutes + 30);
  const latest = done ? tracked.find((x) => x.id === done.id) ?? done : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !name.trim() || phone.replace(/\D/g, '').length < 6) { setErr(t.missing); return; }
    setBusy(true); setErr('');
    try {
      const r = await send({ kind: 'booking', date, time, guests, name, phone, terrace, notes });
      const x: Tracked = { id: r.id, kind: 'booking', status: r.status, at: stamp(), label: `${name} · ${guests} · ${date} ${time}` };
      onBooked(x); setDone(x);
    } catch (e2) { setErr((e2 as Error).message); } finally { setBusy(false); }
  };

  const dateLabel = (iso: string) => new Intl.DateTimeFormat(localeOf(lang), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
  const statusText = (st: string) => (st === 'confirmed' ? t.bk_confirmed : st === 'declined' ? t.bk_declined : t.bk_new);

  return (
    <div className={cx(s.wrap, s.main)}>
      <div className={s.pageHead}><h2>{t.bkTitle}</h2><p>{t.bkSub}</p></div>
      {latest ? (
        <div className={cx(s.panel, s.confirm)}>
          <div className={s.tick}><Check /></div>
          <h3 style={{ font: '28px/1.1 var(--display)', margin: 0 }}>{t.booked}</h3>
          <p style={{ margin: '8px 0 0' }}><b>{name}</b> · {guests} {t.guests.toLowerCase()}<br />{dateLabel(date)} · <span className={s.num}>{time}</span></p>
          <p style={{ margin: '14px 0 0' }}><span className={s.statusPill} style={latest.status === 'confirmed' ? { background: 'color-mix(in srgb, var(--ok) 15%, transparent)', color: 'var(--ok)' } : latest.status === 'declined' ? { color: 'var(--warn)' } : undefined}>{statusText(latest.status)}</span></p>
          <p className={s.small}>{t.bookedNote}</p>
          <button className={cx(s.btn, s.ghost)} onClick={() => { setDone(null); setTime(null); }}>{t.newBooking}</button>
        </div>
      ) : (
        <form className={cx(s.panel, s.stack)} onSubmit={submit} noValidate>
          <div className={s.grid2}>
            <label className={s.field}><span>{t.date}</span><input className={s.in} type="date" value={date} min={now.date} onChange={(e) => { setDate(e.target.value); setTime(null); }} required /></label>
            <div className={s.field}><span>{t.guests}</span>
              <div className={s.stepper}><button type="button" onClick={() => setGuests((n) => Math.max(1, n - 1))}>−</button><output className={s.num}>{guests}</output><button type="button" onClick={() => setGuests((n) => Math.min(30, n + 1))}>+</button></div>
            </div>
          </div>
          <div className={s.field}><span>{t.time}</span>
            {slots.length
              ? <div className={s.slots}>{slots.map((m) => <button type="button" key={m} className={cx(s.slot, s.num)} aria-pressed={time === hhmm(m)} onClick={() => setTime(hhmm(m))}>{hhmm(m)}</button>)}</div>
              : <p className={s.err}>{t.closedDay}</p>}
          </div>
          <div className={s.grid2}>
            <label className={s.field}><span>{t.name}</span><input className={s.in} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} /></label>
            <label className={s.field}><span>{t.phone}</span><input className={s.in} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" maxLength={24} /></label>
          </div>
          <label className={s.switchRow}><span>{t.terrace}</span><input type="checkbox" checked={terrace} onChange={(e) => setTerrace(e.target.checked)} /></label>
          <label className={s.field}><span>{t.notes}</span><textarea className={s.in} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} /></label>
          {err && <p className={s.err}>{err}</p>}
          <button className={cx(s.btn, s.primary)} type="submit" disabled={busy}>{busy ? t.sending : t.confirm}</button>
        </form>
      )}
    </div>
  );
}

/* ─── info ─────────────────────────────────────────────────────────────────── */
function InfoView({ data, t, L, lang, say }: { data: MenuRestaurant; t: MenuCopy; L: LFn; lang: MenuLang; say: (m: string) => void }) {
  const today = zonedNow(data.timezone).day;
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => say(`${t.copied} · ${text}`), () => say(text));
  };
  const rows: { icon: ReactNode; k: string; v: string; href?: string; copy?: string }[] = [
    data.address && { icon: <MapPin className="h-4 w-4" />, k: t.addr, v: data.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.name} ${data.address}`)}` },
    data.phone && { icon: <Phone className="h-4 w-4" />, k: t.phoneL, v: data.phone, href: `tel:${data.phone.replace(/[^+\d]/g, '')}` },
    data.whatsapp && { icon: <MessageCircle className="h-4 w-4" />, k: 'WhatsApp', v: data.whatsapp, href: `https://wa.me/${data.whatsapp.replace(/\D/g, '')}` },
    data.email && { icon: <Mail className="h-4 w-4" />, k: 'Email', v: data.email, href: `mailto:${data.email}` },
    data.instagram && { icon: <Instagram className="h-4 w-4" />, k: 'Instagram', v: `@${data.instagram}`, href: `https://www.instagram.com/${data.instagram}` },
    data.website && { icon: <Globe2 className="h-4 w-4" />, k: 'Web', v: data.website.replace(/^https?:\/\//, ''), href: data.website },
    data.wifiName && { icon: <Wifi className="h-4 w-4" />, k: 'Wi-Fi', v: `${data.wifiName}${data.wifiPassword ? ` · ${data.wifiPassword}` : ''}`, copy: data.wifiPassword || data.wifiName },
  ].filter(Boolean) as { icon: ReactNode; k: string; v: string; href?: string; copy?: string }[];
  const hasHours = Object.values(data.hours || {}).some((r) => r?.length);

  return (
    <div className={cx(s.wrap, s.main, s.stack)}>
      <div className={s.pageHead}><h2>{t.about}</h2>{L(data.about) && <p style={{ whiteSpace: 'pre-line' }}>{L(data.about)}</p>}</div>
      {hasHours && (
        <div className={s.panel}>
          <p className={s.secHead}>{t.hours}</p>
          <table className={cx(s.hours, s.num)}><tbody>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <tr key={d} className={cx(d === today && s.today)}>
                <td>{t.days[d]}</td>
                <td>{data.hours[d]?.length ? data.hours[d].map(([o, c]) => `${hhmm(o)}–${hhmm(c)}`).join(' · ') : t.closed}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
      {rows.length > 0 && (
        <div className={s.panel}>
          {rows.map((r) => (
            <div key={r.k} className={s.kv}>
              <div style={{ minWidth: 0 }}><div className={s.k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{r.icon}{r.k}</div><div className={s.v}>{r.v}</div></div>
              {r.copy
                ? <button className={s.copy} onClick={() => copy(r.copy!)}>{t.copy}</button>
                : r.href && <a className={s.copy} href={r.href} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{r.k === t.addr ? t.directions : r.k === t.phoneL ? t.call : '↗'}</a>}
            </div>
          ))}
        </div>
      )}
      {data.payments.length > 0 && (
        <div className={s.panel}><p className={s.secHead}>{t.pay}</p><div className={s.payRow}>{data.payments.map((p) => <span key={p}>{paymentLabel(p, t)}</span>)}</div></div>
      )}
      <div className={s.panel}>
        <p className={s.secHead}>{t.alTitle}</p>
        <p className={s.small} style={{ marginTop: 0 }}>{t.alText}</p>
        <div className={s.legend}>{Object.entries(ALLERGENS).map(([n, names]) => <span key={n}><span className={s.al}>{n}</span>{names[lang]}</span>)}</div>
      </div>
      {data.branding !== false && <p className={s.foot}><a href="https://mbndev.ma/products/menu" target="_blank" rel="noopener noreferrer">{t.poweredBy}</a></p>}
    </div>
  );
}
