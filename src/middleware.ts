// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Debug için log ekleyelim (Server terminalinde görünür)
    const refreshToken = request.cookies.get('session_refresh_token')?.value;

    const protectedRoutes = ['/dashboard', '/profile', '/settings'];
    const isProtectedRoute = protectedRoutes.some(path => request.nextUrl.pathname.startsWith(path));

    const authRoutes = ['/login', '/register']; // Buraya /auth/login değil, sayfa yolunu yazmalısın
    const isAuthRoute = authRoutes.some(path => request.nextUrl.pathname.startsWith(path));

    // 1. Korumalı rotaya tokensız girmeye çalışıyorsa -> Login'e at
    if (isProtectedRoute && !refreshToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Login/Register sayfasına token varken girmeye çalışıyorsa -> Dashboard'a at
    if (isAuthRoute && refreshToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};