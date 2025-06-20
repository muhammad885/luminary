import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  adminRoutes,
  userRoutes,
  customerRoutes,
} from './routes';

function matchRoute(pathname, routes) {
  return routes.some(route => {
    if (pathname === route) return true;
    if (route.endsWith('*')) {
      const base = route.slice(0, -1);
      return pathname.startsWith(base);
    }
    if (route.includes('[') && route.includes(']')) {
      const routeParts = route.split('/');
      const pathParts = pathname.split('/');
      if (routeParts.length !== pathParts.length) return false;
      return routeParts.every((part, i) =>
        part.startsWith('[') || part === pathParts[i]
      );
    }
    return false;
  });
}

export default async function middleware(request) {
  const { nextUrl } = request;
  const { pathname, search } = nextUrl;

  try {
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const userRole = session?.user?.role;

    if (pathname.startsWith(apiAuthPrefix)) return NextResponse.next();

    const isPublicRoute = matchRoute(pathname, publicRoutes);

    if (authRoutes.includes(pathname)) {
      if (isLoggedIn) {
        const callbackUrl = new URLSearchParams(search).get('callbackUrl') || DEFAULT_LOGIN_REDIRECT;
        return NextResponse.redirect(new URL(callbackUrl, nextUrl));
      }
      return NextResponse.next();
    }

    if (!isLoggedIn && !isPublicRoute) {
      const callbackUrl = pathname + search;
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
      );
    }

    // Map roles to routes
    const roleAccess = {
      Admin: adminRoutes,
      User: userRoutes,
      Customer: customerRoutes,
    };

    const accessibleRoutes = roleAccess[userRole] || [];
    if (
      matchRoute(pathname, adminRoutes) ||
      matchRoute(pathname, userRoutes) ||
      matchRoute(pathname, customerRoutes)
    ) {
      if (!matchRoute(pathname, accessibleRoutes)) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware Error]', error);
    return NextResponse.redirect(new URL('/auth/error', nextUrl));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
