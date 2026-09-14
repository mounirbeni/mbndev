import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, timeAgo, getInitials } from './utils';

describe('formatCurrency', () => {
  it('formats a whole-dollar amount', () => {
    expect(formatCurrency(1500)).toBe('$1,500.00');
  });

  it('formats a fractional amount', () => {
    expect(formatCurrency(99.9)).toBe('$99.90');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('supports a non-USD currency code', () => {
    expect(formatCurrency(20, 'EUR')).toBe('€20.00');
  });
});

describe('formatDate', () => {
  it('renders a short month/day/year', () => {
    expect(formatDate('2026-01-15T10:00:00.000Z')).toBe('Jan 15, 2026');
  });
});

describe('timeAgo', () => {
  it('reports "just now" for a timestamp seconds in the past', () => {
    const now = new Date(Date.now() - 5_000).toISOString();
    expect(timeAgo(now)).toBe('just now');
  });

  it('reports minutes for a timestamp within the last hour', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
    expect(timeAgo(tenMinAgo)).toBe('10m ago');
  });

  it('reports hours for a timestamp within the last day', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3_600_000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('3h ago');
  });

  it('reports days for anything older', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe('2d ago');
  });
});

describe('getInitials', () => {
  it('takes the first letter of the first two words', () => {
    expect(getInitials('Jane Doe')).toBe('JD');
  });

  it('uppercases lowercase input', () => {
    expect(getInitials('jane doe')).toBe('JD');
  });

  it('handles a single-word name', () => {
    expect(getInitials('Cher')).toBe('C');
  });

  it('caps at two characters for names with more than two words', () => {
    expect(getInitials('Jane Middle Doe')).toBe('JM');
  });
});
