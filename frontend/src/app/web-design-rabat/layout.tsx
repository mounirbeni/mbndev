import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { cityMetadata, cityJsonLd } from '@/lib/cityPages';

export const metadata: Metadata = cityMetadata('rabat', 'web-design-rabat');

export default function RabatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={cityJsonLd('rabat', 'web-design-rabat')} />
      {children}
    </>
  );
}
