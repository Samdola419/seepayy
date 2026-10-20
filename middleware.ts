import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Clean host (remove port if present for domain checking)
  const hostWithoutPort = hostname.split(':')[0];

  // If already accessing internal paths or static files, allow pass-through
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/store') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Support query-parameter store routing on Vercel deployments (e.g. ?shop=mama or ?store=mama)
  const shopQuery = url.searchParams.get('shop') || url.searchParams.get('store');
  if (shopQuery && url.pathname === '/') {
    url.pathname = `/store/${shopQuery.toLowerCase()}`;
    return NextResponse.rewrite(url);
  }

  // System/root domains that should serve the main landing page and platform dashboards
  const isRootDomain =
    hostWithoutPort === 'seepay.shop' ||
    hostWithoutPort === 'www.seepay.shop' ||
    hostWithoutPort === 'localhost' ||
    hostWithoutPort === '127.0.0.1' ||
    hostWithoutPort.endsWith('.vercel.app');

  if (isRootDomain) {
    return NextResponse.next();
  }

  // Extract subdomain: e.g. "mama.seepay.shop" -> "mama", "mama.localhost:3000" -> "mama"
  let subdomain = '';
  if (hostname.includes('.seepay.shop')) {
    subdomain = hostname.replace('.seepay.shop', '');
  } else if (hostname.includes('.localhost')) {
    subdomain = hostname.split('.localhost')[0];
  } else {
    const parts = hostWithoutPort.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  if (subdomain && subdomain !== 'www') {
    url.pathname = `/store/${subdomain.toLowerCase()}${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
