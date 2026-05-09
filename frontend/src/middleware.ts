import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// We can't reliably read localStorage tokens here (edge runtime, server side),
// but we CAN gate dashboard routes by checking for the presence of an auth
// indicator cookie that AuthContext sets alongside localStorage. This gives
// us a fast server-side redirect for unauthenticated visits to /dashboard
// without waiting for the client to mount.
//
// The actual JWT verification still happens against the backend on every
// API call — this middleware is just a UX-level guard, not a security
// boundary.

const PROTECTED_PREFIXES = ['/dashboard'];
const ADMIN_PREFIX       = '/dashboard/admin';
const CLIENT_PREFIX      = '/dashboard/client';
const AUTH_PAGES         = ['/login', '/signup'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const auth = req.cookies.get('mbndev_auth')?.value; // "client" | "admin" | undefined

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_PAGES.includes(pathname);

  // Unauthenticated → bounce off protected routes
  if (isProtected && !auth) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in users shouldn't see /login or /signup — send to their dashboard
  if (isAuthPage && auth) {
    const url = req.nextUrl.clone();
    url.pathname = auth === 'admin' ? '/dashboard/admin' : '/dashboard/client';
    return NextResponse.redirect(url);
  }

  // Role mismatch — clients can't open admin routes and vice-versa
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
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
};
