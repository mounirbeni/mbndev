import {
  Sparkles, Smartphone, BellRing, Upload, DollarSign, Gauge, ShieldCheck, Target,
  type LucideIcon,
} from 'lucide-react';

export const APP_VERSION = '3.7.0';

export interface ChangeEntry {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: 'new' | 'fix' | 'improved';
  href?: string;
  /** Who sees it in What's New. Omitted = everyone. */
  audience?: 'admin' | 'client';
}

export const CHANGELOG: ChangeEntry[] = [
  {
    icon: BellRing,
    title: 'Phone Notifications',
    desc: 'Get notified on your phone the moment there’s a project update, a new message or a payment confirmation. Turn it on from the bell icon in your dashboard.',
    tag: 'new',
  },
  {
    icon: Upload,
    title: 'Share Big Files',
    desc: 'Send us ZIP, RAR and 7z archives, videos, Office documents and images of up to 500 MB, with a live progress bar while they upload.',
    tag: 'improved',
    audience: 'client',
  },
  {
    icon: Upload,
    title: 'Big File Uploads',
    desc: 'Uploads now go straight to private storage — up to 500 MB per file, with progress, and code archives reach the client intact.',
    tag: 'fix',
    audience: 'admin',
  },
  {
    icon: Smartphone,
    title: 'Install the App',
    desc: 'Add MBN DEV to your Home Screen for a full-screen, app-like experience. On iPhone this is also what lets you receive notifications.',
    tag: 'new',
  },
  {
    icon: Sparkles,
    title: 'A Fresh New Look',
    desc: 'A refined design across the platform and your dashboard — smoother animations, live counters and a cleaner layout on every screen size.',
    tag: 'improved',
  },
  {
    icon: DollarSign,
    title: 'Clear Pricing in USD',
    desc: 'All prices, invoices and payment amounts are shown in US dollars, so what you see is exactly what you pay.',
    tag: 'improved',
    audience: 'client',
  },
  {
    icon: Gauge,
    title: 'More Reliable Live Updates',
    desc: 'Messages and notifications inside your dashboard now reconnect seamlessly in the background, so you never miss an update.',
    tag: 'improved',
  },
  {
    icon: ShieldCheck,
    title: 'Daily Payment Checks',
    desc: 'The nightly reconciliation now runs again and duplicate “sync drift” alerts are gone — you get one alert per real issue.',
    tag: 'fix',
    audience: 'admin',
  },
  {
    icon: Target,
    title: 'Leads in USD',
    desc: 'Nightly rates in the Leads list are now shown in US dollars, like the rest of the platform.',
    tag: 'improved',
    audience: 'admin',
  },
];
