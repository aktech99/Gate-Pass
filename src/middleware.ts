// src/middleware.ts - Fixed version
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authData = request.cookies.get('auth-storage')?.value;

  // Parse the auth data if it exists
  let token = null;
  let user = null;

  if (authData) {
    try {
      const parsedAuth = JSON.parse(decodeURIComponent(authData));
      token = parsedAuth.state?.token;
      user = parsedAuth.state?.user;
    } catch (error) {
      console.error('Error parsing auth data:', error);
    }
  }

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has token and trying to access login/register, redirect to appropriate dashboard
  if (
    token &&
    user &&
    (pathname.startsWith('/login') || pathname.startsWith('/register'))
  ) {
    const dashboardUrl = getRoleDashboard(user.role);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Role-based route protection
  if (token && user) {
    const userRole = user.role;

    // Admin routes
    if (pathname.startsWith('/admin') && userRole !== 'SUPER_ADMIN') {
      const dashboardUrl = getRoleDashboard(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // Teacher routes
    if (pathname.startsWith('/teacher') && userRole !== 'TEACHER') {
      const dashboardUrl = getRoleDashboard(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // Student routes
    if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
      const dashboardUrl = getRoleDashboard(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // Security routes
    if (pathname.startsWith('/security') && userRole !== 'SECURITY') {
      const dashboardUrl = getRoleDashboard(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // Redirect from generic dashboard to role-specific dashboard
    if (pathname === '/dashboard') {
      const dashboardUrl = getRoleDashboard(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }

  return NextResponse.next();
}

function getRoleDashboard(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'TEACHER':
      return '/teacher';
    case 'STUDENT':
      return '/student';
    case 'SECURITY':
      return '/security';
    default:
      return '/';
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|health).*)'],
};
