import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
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

      // التعديل الرئيسي هنا: رفض المستخدمين غير الأدمن تماماً
      if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
        const signinUrl = new URL('/signin', request.url);
        signinUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(signinUrl);
      }

      // السماح فقط للأدمن والسوبر أدمن
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
