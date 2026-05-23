import { Pencil, BookmarkCheck, CreditCard, ShieldCheck, type LucideIcon } from 'lucide-react';

export const APP_VERSION = '2.7.4';

export interface ChangeEntry {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: 'new' | 'fix' | 'improved';
}

export const CHANGELOG: ChangeEntry[] = [
  {
    icon: Pencil,
    title: 'Edit Order Before Paying',
    desc: 'Update your order description and notes directly on the checkout page before submitting any payment.',
    tag: 'new',
  },
  {
    icon: BookmarkCheck,
    title: 'Pay Later',
    desc: 'Save your order and come back to pay when you\'re ready — no pressure to pay immediately.',
    tag: 'new',
  },
  {
    icon: CreditCard,
    title: 'Payment Status Tracking',
    desc: 'Once you submit a payment, the form is hidden and replaced with a status card until the admin reviews it.',
    tag: 'improved',
  },
  {
    icon: ShieldCheck,
    title: 'Account Deletion Flow',
    desc: 'Request account deletion safely — admin confirms before anything is permanently removed.',
    tag: 'new',
  },
];
