export const APP_VERSION = '2.7.2';

export interface ChangeEntry {
  icon: string;
  title: string;
  desc: string;
  tag: 'new' | 'fix' | 'improved';
}

export const CHANGELOG: ChangeEntry[] = [
  {
    icon: '📱',
    title: 'Invoices on Mobile',
    desc: 'Invoice buttons now visible on all screen sizes. Added Invoices to the mobile navigation sheet.',
    tag: 'fix',
  },
  {
    icon: '📄',
    title: 'Expanded About Page',
    desc: 'New sections: My Story, Core Values, Why Work With Me, and an FAQ — fully translated.',
    tag: 'new',
  },
  {
    icon: '🎨',
    title: 'UI Polish',
    desc: 'Removed scroll indicators, cleaned up the navbar, and refined the premium purple design system.',
    tag: 'improved',
  },
  {
    icon: '🌍',
    title: 'Language Cleanup',
    desc: 'Platform now communicates in English and Arabic only. All French mentions removed.',
    tag: 'improved',
  },
];
