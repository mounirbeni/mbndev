import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { cityMetadata, cityJsonLd } from '@/lib/cityPages';

export const metadata: Metadata = cityMetadata('casablanca', 'web-design-casablanca');

export default function CasablancaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={cityJsonLd('casablanca', 'web-design-casablanca')} />
      {children}
    </>
  );
}
