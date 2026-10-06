import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Chat',
  robots: { index: false, follow: false },
};

// Transparent from the first paint, so the host page never sees a dark box.
const TRANSPARENT = 'html,body{background:transparent!important}';

export default function WidgetLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: TRANSPARENT }} />
      {children}
    </>
  );
}
