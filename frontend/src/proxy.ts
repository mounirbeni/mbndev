import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a UX guard based on the role cookie. The backend still validates the
// JWT on every protected API call, so this proxy is not a security boundary.
const PROTECTED_PREFIXES = ['/dashboard'];
const ADMIN_PREFIX = '/dashboard/admin';
const CLIENT_PREFIX = '/dashboard/client';
const AUTH_PAGES = ['/login', '/signup'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const auth = req.cookies.get('mbndev_auth')?.value;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isProtected && !auth) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && auth) {
    const url = req.nextUrl.clone();
    url.pathname = auth === 'admin' ? '/dashboard/admin' : '/dashboard/client';
    return NextResponse.redirect(url);
  }

  if (auth && pathname.startsWith(ADMIN_PREFIX) && auth !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard/client';
    return NextResponse.redirect(url);
  }
  if (auth && pathname.startsWith(CLIENT_PREFIX) && auth !== 'client') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard/admin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
