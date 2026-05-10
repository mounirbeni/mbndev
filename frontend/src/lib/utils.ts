import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const statusColors: Record<string, string> = {
  pending:                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  pending_verification:   'bg-amber-500/20 text-amber-300 border-amber-500/30',
  paid:                   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'in-progress':          'bg-blue-500/20 text-blue-400 border-blue-500/30',
  review:                 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  revision:               'bg-orange-500/20 text-orange-400 border-orange-500/30',
  completed:              'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled:              'bg-red-500/20 text-red-400 border-red-500/30',
  failed:                 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded:               'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export const statusLabels: Record<string, string> = {
  pending:              'Pending',
  pending_verification: 'Awaiting Verification',
  paid:                 'Paid',
  'in-progress':        'In Progress',
  review:               'In Review',
  revision:             'Revision',
  completed:            'Completed',
  cancelled:            'Cancelled',
  failed:               'Failed',
  refunded:             'Refunded',
};

/** Locale-aware status label. Pass the `t` function from useLanguage(). */
export function getStatusLabel(status: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    pending:              t('status.pending'),
    pending_verification: t('status.pendingVerif'),
    paid:                 t('status.paid'),
    'in-progress':        t('status.inProgress'),
    review:               t('status.review'),
    revision:             t('status.revision'),
    completed:            t('status.completed'),
    cancelled:            t('status.cancelled'),
    failed:               t('status.failed'),
    refunded:             t('status.refunded'),
    delivered:            t('status.completed'),
    unpaid:               t('status.unpaid'),
  };
  return map[status] || status;
}

/** @deprecated Use `getProjectTypeLabel(type, t)` for locale-aware labels */
export const projectTypeLabels: Record<string, string> = {
  'landing-page': 'Landing Page',
  ecommerce: 'E-Commerce Store',
  saas: 'SaaS Dashboard',
  portfolio: 'Portfolio',
  'web-app': 'Web Application',
  custom: 'Custom Project',
};

/**
 * Returns the locale-aware project type label.
 * Pass the `t` function from `useLanguage()`.
 */
export function getProjectTypeLabel(type: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    website:        t('request.svc.website'),
    ecommerce:      t('request.svc.ecommerce'),
    dashboard:      t('request.svc.dashboard'),
    mobile:         t('request.svc.mobile'),
    custom:         t('request.svc.custom'),
    'landing-page': t('services.landing.title'),
    saas:           t('services.saas.title'),
    portfolio:      'Portfolio',
    'web-app':      t('services.webapp.title'),
  };
  return map[type] || type;
}

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

/** Locale-aware time-ago: pass the `t` translation function from useLanguage(). */
export function makeTimeAgo(t: (k: string) => string) {
  return (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return t('notif.justNow');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}${t('notif.minsAgo')}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}${t('notif.hoursAgo')}`;
    const days = Math.floor(hours / 24);
    return `${days}${t('notif.daysAgo')}`;
  };
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
