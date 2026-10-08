'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { Copy, Download, ExternalLink, Printer, QrCode } from 'lucide-react';
import type { MenuRestaurant } from '@/lib/api';
import { fieldCls, labelCls } from './ui';

export default function ShareTab({ restaurant }: { restaurant: MenuRestaurant }) {
  const [origin, setOrigin] = useState('');
  const [qr, setQr] = useState('');
  const [tables, setTables] = useState(12);
  const link = `${origin}/m/${restaurant.id}`;

  useEffect(() => {
    const o = window.location.origin;
    setOrigin(o);
    QRCode.toDataURL(`${o}/m/${restaurant.id}`, { width: 900, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#111827', light: '#ffffff' } }).then(setQr, () => {});
  }, [restaurant.id]);

  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); toast.success('Copied'); } catch { toast.error('Copy failed'); } };
  const card = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5';

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <section className={card}>
          <h2 className="font-semibold text-white">Menu link</h2>
          <p className="mt-1 text-sm text-slate-400">Put it on Instagram, Google Business Profile (“Menu” link), WhatsApp and your website.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={link} className={`${fieldCls} font-mono`} onFocus={(e) => e.target.select()} aria-label="Menu link" />
            <button onClick={() => copy(link)} className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#14092b]"><Copy className="h-4 w-4" />Copy</button>
            <a href={`/m/${restaurant.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-slate-200"><ExternalLink className="h-4 w-4" />Open</a>
          </div>
          <p className="mt-3 text-xs text-slate-500">Booking page directly: <button onClick={() => copy(`${link}#book`)} className="py-1 font-mono text-violet-300 underline break-all text-left">{link}#book</button></p>
        </section>

        <section className={card}>
          <h2 className="flex items-center gap-2 font-semibold text-white"><QrCode className="h-4 w-4 text-violet-300" />Table QR codes</h2>
          <p className="mt-1 text-sm text-slate-400">Each table gets its own code, so orders and waiter calls arrive with the right table number. Print on card or sticker paper and place one on each table.</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="block"><span className={labelCls}>Number of tables</span>
              <input type="number" min={1} max={120} value={tables} onChange={(e) => setTables(Math.max(1, Math.min(120, Number(e.target.value) || 1)))} className={`${fieldCls} mt-1.5 w-32`} /></label>
            <a href={`/m/${restaurant.id}/qr?tables=${tables}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#14092b]"><Printer className="h-4 w-4" />Print table cards</a>
            <a href={`/m/${restaurant.id}/qr`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-slate-200"><Printer className="h-4 w-4" />Print a window poster</a>
          </div>
        </section>
      </div>

      <section className={`${card} text-center`}>
        <h2 className="font-semibold text-white">Main QR code</h2>
        {qr
          // eslint-disable-next-line @next/next/no-img-element -- generated data: URL
          ? <img src={qr} alt="QR code of the menu" className="mx-auto mt-4 w-full max-w-[240px] rounded-xl" />
          : <div className="mx-auto mt-4 aspect-square w-full max-w-[240px] rounded-xl bg-white/5" />}
        <a href={qr} download={`${restaurant.name.replace(/[^\w-]+/g, '-')}-menu-qr.png`} className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200"><Download className="h-4 w-4" />Download PNG</a>
        <p className="mt-2 text-xs text-slate-500">For flyers, the window or the counter (no table number).</p>
      </section>
    </div>
  );
}
