import { Playfair_Display, Cormorant_Garamond, IBM_Plex_Sans_Arabic, Aref_Ruqaa } from 'next/font/google';
import { Building2, Compass } from 'lucide-react';

/*
 * Each project's name set the way its own site sets it — typeface, colour and
 * mark — so the reel credits read as that brand, not as MBN DEV.
 * Colours are lifted a little where the original sits on a light page.
 */

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700'], display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600'], display: 'swap' });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['700'], display: 'swap' });
const ruqaa = Aref_Ruqaa({ subsets: ['arabic'], weight: ['700'], display: 'swap' });

const small = 'block font-mono text-[max(0.17em,10px)] tracking-[0.42em] uppercase mt-[0.35em] leading-none';

function TransoMark() {
  return (
    <svg viewBox="0 0 40 28" className="h-[0.72em] w-auto mr-[0.18em] -mt-[0.06em]" aria-hidden>
      <path d="M2 3h36l-3 6H24l-6 17h-7l6-17H5z" fill="#16a34a" />
      <path d="M8 13h12l-2 5H6z" fill="#22c55e" />
    </svg>
  );
}

export default function BrandWordmark({ brand, title }: { brand: string; title: string }) {
  switch (brand) {
    case 'tarique':
      return (
        <span className="inline-block text-left" dir="rtl">
          <span className={`${plexArabic.className} block leading-none`} style={{ color: '#e6eeff' }}>
            طريق
          </span>
          <span className={small} style={{ color: '#60a5fa', direction: 'ltr' }}>Tarique</span>
        </span>
      );
    case 'chronocraft':
      return (
        <span
          className={`${playfair.className} font-semibold`}
          style={{ background: 'linear-gradient(180deg, #f6e3b0 0%, #d6a650 55%, #a87b32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          ChronoCraft
        </span>
      );
    case 'abaq':
      return (
        <span className="inline-block text-left" dir="rtl">
          <span
            className={`${ruqaa.className} block leading-[1.05] text-[1.45em]`}
            style={{ background: 'linear-gradient(180deg, #f8e7b5 0%, #d4a24c 60%, #9c7430 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            عبق
          </span>
          <span className={small} style={{ color: '#d4a24c', direction: 'ltr' }}>Abaq perfumes</span>
        </span>
      );
    case 'riadconnect':
      return (
        <span className={`${playfair.className} font-bold inline-flex items-center gap-[0.18em] text-[0.8em]`} style={{ color: '#f97316' }}>
          <Building2 className="h-[0.8em] w-[0.8em]" strokeWidth={2.2} />
          RiadConnect
        </span>
      );
    case 'emll':
      return (
        <span className="inline-flex items-center gap-[0.2em] font-bold tracking-[-0.02em] text-[0.6em]" style={{ color: '#fb923c' }}>
          <Compass className="h-[0.95em] w-[0.95em]" strokeWidth={2.2} />
          Explore Marrakesh
        </span>
      );
    case 'caramelio':
      return (
        <span className={`${cormorant.className} font-semibold`} style={{ color: '#e0a46a' }}>
          Caramelio<span style={{ color: '#f5deb3' }}>.</span>
        </span>
      );
    case 'transo':
      return (
        <span className="inline-flex items-center font-extrabold tracking-[-0.045em]" style={{ color: '#4ade80' }}>
          <TransoMark />
          Transo
        </span>
      );
    case 'vitacore':
      return (
        <span className="inline-block">
          <span className="block font-extrabold tracking-[-0.035em] leading-none" style={{ color: '#f0fdfa' }}>VitaCore</span>
          <span className={small} style={{ color: '#2dd4bf' }}>Parapharmacie</span>
        </span>
      );
    default:
      return <span className="serif-accent silk-text">{title}</span>;
  }
}
