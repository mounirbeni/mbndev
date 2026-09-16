import {
  Target, Send, Sparkles, Smartphone, Accessibility, Command, Settings,
  MapPin, Shield,
  type LucideIcon,
} from 'lucide-react';

export const APP_VERSION = '3.6.0';

export interface ChangeEntry {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: 'new' | 'fix' | 'improved';
  href?: string;
}

export const CHANGELOG: ChangeEntry[] = [
  {
    icon: MapPin,
    title: 'SEO: New Location Pages',
    desc: 'Dedicated pages for Marrakech, Casablanca, and Rabat help local businesses in these cities find us on Google — plus every blog article now has its own optimized title and description for better search visibility.',
    tag: 'new',
  },
  {
    icon: Shield,
    title: 'Security Improvements',
    desc: 'We\'ve rolled out a range of security and reliability improvements across the platform to keep your account and data safer.',
    tag: 'improved',
  },
  {
    icon: Settings,
    title: 'Admin Settings',
    desc: 'Admins finally get their own Settings page — update your name, company and phone, and change your password without leaving the dashboard.',
    tag: 'new',
    href: '/dashboard/admin/settings',
  },
  {
    icon: Target,
    title: 'Leads Manager',
    desc: 'Track prospects end-to-end — import leads from CSV, update statuses, and never lose a follow-up.',
    tag: 'new',
    href: '/dashboard/admin/leads',
  },
  {
    icon: Send,
    title: 'Bulk Outreach Email',
    desc: 'Send your outreach email to every new lead at once — delivered in parallel, no timeouts.',
    tag: 'new',
    href: '/dashboard/admin/leads',
  },
  {
    icon: Sparkles,
    title: 'Landing Motion Upgrade',
    desc: 'Magnetic buttons, cursor-reactive parallax, 3D-tilt cards, animated pricing, and a swipeable testimonial carousel across the site.',
    tag: 'improved',
  },
  {
    icon: Smartphone,
    title: 'Mobile Experience',
    desc: 'Device-tilt parallax in the hero, touch press feedback on cards, a glowing bottom-nav indicator — and Leads is now reachable from the mobile menu.',
    tag: 'improved',
  },
  {
    icon: Command,
    title: 'Command Palette: Leads',
    desc: 'Press ⌘K and jump straight to the Leads manager — now included in admin navigation results.',
    tag: 'improved',
    href: '/dashboard/admin/leads',
  },
  {
    icon: Accessibility,
    title: 'Reduced Motion Support',
    desc: 'The entire site now respects your system "reduce motion" setting — decorative animation is disabled automatically.',
    tag: 'new',
  },
];
