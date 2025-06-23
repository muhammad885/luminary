import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
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
    if (route === pathname) return true;

    if (route.endsWith('*')) {
      const base = route.slice(0, -1);
      return pathname.startsWith(base);
    }

    if (route.includes('[') && route.includes(']')) {
      const routeParts = route.split('/').filter(Boolean);
      const pathParts = pathname.split('/').filter(Boolean);
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
    // Skip middleware for API auth routes
    if (apiAuthPrefix.some(prefix => pathname.startsWith(prefix))) {
      return NextResponse.next();
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    const isLoggedIn = !!token;
    const userRole = token?.role;
    const isPublicRoute = matchRoute(pathname, publicRoutes);

    // Handle /auth/* routes (e.g. login, register)
    if (authRoutes.some(route => matchRoute(pathname, [route]))) {
      if (isLoggedIn) {
        const rawCallback = new URLSearchParams(search).get("callbackUrl");
        const safeRedirect = rawCallback?.startsWith("/")
          ? new URL(rawCallback, nextUrl.origin).toString()
          : new URL(DEFAULT_LOGIN_REDIRECT, nextUrl.origin).toString();

        return NextResponse.redirect(safeRedirect);
      }
      return NextResponse.next();
    }

    // Redirect guests trying to access protected routes
    if (!isLoggedIn && !isPublicRoute) {
      const callbackPath = pathname + (search || "");
      const loginUrl = new URL("/auth/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", callbackPath);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access restriction
    if (isLoggedIn) {
      const roleAccess = {
        Admin: [...publicRoutes, ...adminRoutes],
        User: [...publicRoutes, ...userRoutes],
        Customer: [...publicRoutes, ...customerRoutes],
      };

      const allProtectedRoutes = [...adminRoutes, ...userRoutes, ...customerRoutes];
      if (matchRoute(pathname, allProtectedRoutes)) {
        const allowedRoutes = roleAccess[userRole] || publicRoutes;
        if (!matchRoute(pathname, allowedRoutes)) {
          return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[MIDDLEWARE_ERROR]', error);
    const errorUrl = new URL('/auth/error', nextUrl.origin);
    errorUrl.searchParams.set('error', 'middleware_failure');
    return NextResponse.redirect(errorUrl);
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|_next/webpack-hmr).*)',
  ],
};
