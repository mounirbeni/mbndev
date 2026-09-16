'use client';

import CityLandingPage from '@/components/landing/CityLandingPage';
import { CITY_PAGES } from '@/lib/cityPages';

export default function RabatPage() {
  return <CityLandingPage data={CITY_PAGES.rabat} />;
}
