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

// Match routes (handles exact, wildcard *, and dynamic [id] routes)
function matchRoute(pathname, routes) {
  return routes.some(route => {
    if (route === pathname) return true;

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

// Handle wildcard match for API auth prefix
function matchesApiAuthPrefix(pathname) {
  return apiAuthPrefix.some(prefix => {
    if (prefix.endsWith('*')) {
      return pathname.startsWith(prefix.slice(0, -1));
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export default async function middleware(request) {
  const { nextUrl } = request;
  const { pathname, search } = nextUrl;

  try {
    // ✅ Skip middleware for all API auth routes
    if (matchesApiAuthPrefix(pathname)) {
      return NextResponse.next();
    }

    // ⛔ Require session for protected routes
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const userRole = session?.user?.role;

    const isPublicRoute = matchRoute(pathname, publicRoutes);

    // ✅ Skip login page for authenticated users
    if (authRoutes.includes(pathname)) {
      if (isLoggedIn) {
        const callbackUrl = new URLSearchParams(search).get('callbackUrl') || DEFAULT_LOGIN_REDIRECT;
        return NextResponse.redirect(new URL(callbackUrl, nextUrl));
      }
      return NextResponse.next();
    }

    // ⛔ Redirect guests from protected pages to login
    if (!isLoggedIn && !isPublicRoute) {
      const callbackUrl = pathname + search;
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
      );
    }

    // ✅ Role-based access check
    const roleAccess = {
      Admin: adminRoutes,
      User: userRoutes,
      Customer: customerRoutes,
    };

    const allowedRoutes = roleAccess[userRole] || [];

    const isRoleRestrictedRoute = [
      ...adminRoutes,
      ...userRoutes,
      ...customerRoutes,
    ];

    if (matchRoute(pathname, isRoleRestrictedRoute)) {
      if (!matchRoute(pathname, allowedRoutes)) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware Error]', error);
    return NextResponse.redirect(new URL('/auth/error', nextUrl));
  }
}

// ✅ Matcher: skip static assets and image requests
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
