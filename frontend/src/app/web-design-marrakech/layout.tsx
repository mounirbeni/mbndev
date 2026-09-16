import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { cityMetadata, cityJsonLd } from '@/lib/cityPages';

export const metadata: Metadata = cityMetadata('marrakech', 'web-design-marrakech');

export default function MarrakechLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={cityJsonLd('marrakech', 'web-design-marrakech')} />
      {children}
    </>
  );
}
