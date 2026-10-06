/** `?next=` target after sign-in/sign-up — same-site paths only (no open redirect). */
export function safeNext(): string | null {
  if (typeof window === 'undefined') return null;
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : null;
}
