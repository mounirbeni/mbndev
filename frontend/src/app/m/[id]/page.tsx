'use client';

import { use } from 'react';
import PublicMenu from '@/components/menu/PublicMenu';
import { DEMO_MENUS } from '@/lib/menuDemo';

/** Public digital menu a restaurant shares with its guests (link / table QR codes). /m/demo is the live demo; DEMO_MENUS also holds sales demos (e.g. /m/caramelio). */
export default function PublicMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PublicMenu id={id} demo={Object.hasOwn(DEMO_MENUS, id) ? DEMO_MENUS[id] : undefined} />;
}
