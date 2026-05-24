import { Pencil, BookmarkCheck, CreditCard, ShieldCheck, ListChecks, Clock, StickyNote, Zap, type LucideIcon } from 'lucide-react';

export const APP_VERSION = '2.7.5';

export interface ChangeEntry {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: 'new' | 'fix' | 'improved';
  href?: string;
}

export const CHANGELOG: ChangeEntry[] = [
  {
    icon: ListChecks,
    title: 'Project Stage Tracker',
    desc: 'See exactly where your project stands — a live visual stepper shows every stage from order to delivery.',
    tag: 'new',
    href: '/dashboard/client/projects',
  },
  {
    icon: Clock,
    title: 'Deadline Urgency Badge',
    desc: 'Project cards now highlight deadlines in real time — orange for 3 days left, red for overdue.',
    tag: 'new',
    href: '/dashboard/client/projects',
  },
  {
    icon: StickyNote,
    title: 'Admin Client Notes',
    desc: 'Admins can now attach private notes to any client — visible only in the admin panel.',
    tag: 'new',
    href: '/dashboard/admin/clients',
  },
  {
    icon: Zap,
    title: 'Quick Status Update',
    desc: 'Admins can change a project status directly from the projects list — no need to open the full project.',
    tag: 'improved',
    href: '/dashboard/admin/projects',
  },
  {
    icon: Pencil,
    title: 'Edit Order Before Paying',
    desc: 'Update your order description and notes directly on the checkout page before submitting any payment.',
    tag: 'new',
    href: '/dashboard/client/orders',
  },
  {
    icon: BookmarkCheck,
    title: 'Pay Later',
    desc: 'Save your order and come back to pay when you\'re ready — no pressure to pay immediately.',
    tag: 'new',
    href: '/dashboard/client/orders',
  },
  {
    icon: CreditCard,
    title: 'Payment Status Tracking',
    desc: 'Once you submit a payment, the form is hidden and replaced with a status card until the admin reviews it.',
    tag: 'improved',
    href: '/dashboard/client/payments',
  },
  {
    icon: ShieldCheck,
    title: 'Account Deletion Flow',
    desc: 'Request account deletion safely — admin confirms before anything is permanently removed.',
    tag: 'new',
    href: '/dashboard/client/settings',
  },
];
