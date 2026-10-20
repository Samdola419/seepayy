import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  const allowedDomains = ['seepay.shop', 'localhost:3000'];
  
  let currentHost = hostname;
  allowedDomains.forEach((domain) => {
    currentHost = currentHost.replace(`.${domain}`, '');
  });

  if (currentHost === hostname || currentHost === 'www' || currentHost === 'seepay.shop') {
    return NextResponse.next();
  }

  url.pathname = `/store/${currentHost}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
