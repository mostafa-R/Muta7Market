import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Middleware executing
  const protectedPaths = ['/dashboard', '/admin'];
  const currentPath = request.nextUrl.pathname;

  const isProtectedPath = protectedPaths.some(path =>
    currentPath.startsWith(path)
  );

  if (isProtectedPath) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      const signinUrl = new URL('/signin', request.url);
      signinUrl.searchParams.set('error', 'unauthenticated');
      return NextResponse.redirect(signinUrl);
    }

    try {
      const decoded = jwt.decode(token);

      if (!decoded) {
        const signinUrl = new URL('/signin', request.url);
        signinUrl.searchParams.set('error', 'invalid-token');
        return NextResponse.redirect(signinUrl);
      }

      if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
        const signinUrl = new URL('/signin', request.url);
        signinUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(signinUrl);
      }

      return NextResponse.next();
    } catch (err) {
      const signinUrl = new URL('/signin', request.url);
      signinUrl.searchParams.set('error', 'invalid-token');
      return NextResponse.redirect(signinUrl);
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};
