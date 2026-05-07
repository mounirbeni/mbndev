import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const statusColors: Record<string, string> = {
  pending:      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  paid:         'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'in-progress':'bg-blue-500/20 text-blue-400 border-blue-500/30',
  review:       'bg-purple-500/20 text-purple-400 border-purple-500/30',
  revision:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  completed:    'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled:    'bg-red-500/20 text-red-400 border-red-500/30',
};

export const statusLabels: Record<string, string> = {
  pending:      'Pending',
  paid:         'Paid',
  'in-progress':'In Progress',
  review:       'In Review',
  revision:     'Revision',
  completed:    'Completed',
  cancelled:    'Cancelled',
};

export const projectTypeLabels: Record<string, string> = {
  'landing-page': 'Landing Page',
  ecommerce: 'E-Commerce Store',
  saas: 'SaaS Dashboard',
  portfolio: 'Portfolio',
  'web-app': 'Web Application',
  custom: 'Custom Project',
};

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
