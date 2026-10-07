'use client';

import { use } from 'react';
import PublicMenu from '@/components/menu/PublicMenu';
import { DEMO_RESTAURANT } from '@/lib/menuDemo';

/** Public digital menu a restaurant shares with its guests (link / table QR codes). /m/demo is the live demo. */
export default function PublicMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PublicMenu id={id} demo={id === 'demo' ? DEMO_RESTAURANT : undefined} />;
}
