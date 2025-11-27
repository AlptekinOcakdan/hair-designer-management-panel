import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const refreshToken = request.cookies.get('session_refresh_token')?.value;
    const accessToken = request.cookies.get('session_access_token')?.value;

    // Korumalı rotaları genişlettim
    const protectedRoutes = ['/dashboard', '/profile', '/settings', '/admin', '/manager', '/staff'];
    const isProtectedRoute = protectedRoutes.some(path => request.nextUrl.pathname.startsWith(path));

    const authRoutes = ['/login', '/register', '/auth/login', '/auth/register'];
    const isAuthRoute = authRoutes.some(path => request.nextUrl.pathname.startsWith(path));

    // 1. Korumalı rotaya tokensız girmeye çalışıyorsa -> Login'e at
    if (isProtectedRoute && !refreshToken) {
        // Kullanıcı giriş yapmaya çalıştığı sayfayı query param olarak saklayabiliriz (opsiyonel)
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Rol tabanlı erişim kontrolü ve yönlendirme mantığı
    if (refreshToken && accessToken) {
        try {
            // JWT Payload decode (Edge Runtime uyumlu yöntem)
            const payloadPart = accessToken.split('.')[1];
            if (payloadPart) {
                // Base64Url -> Base64
                const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = atob(base64);
                const payload = JSON.parse(jsonPayload);
                const roles: string[] = payload.roles || [];

                // Kullanıcının varsayılan ana sayfası (Role göre)
                let defaultRolePath = '/dashboard';
                if (roles.includes('SYS_ADMIN') || roles.includes('ADMIN')) {
                    defaultRolePath = '/admin/organisations';
                } else if (roles.includes('OWNER') || roles.includes('MANAGER')) {
                    defaultRolePath = '/manager/dashboard';
                } else if (roles.includes('STAFF')) {
                    defaultRolePath = '/staff/appointments';
                }

                // 2. Login/Register sayfasına token varken girmeye çalışıyorsa -> Role göre yönlendir
                if (isAuthRoute) {
                    return NextResponse.redirect(new URL(defaultRolePath, request.url));
                }

                // 3. Rol Bazlı Erişim Kontrolü (Yetkisiz alana girmeyi engelle)
                const path = request.nextUrl.pathname;

                // Admin değilse /admin rotasına giremez
                if (path.startsWith('/admin') && !(roles.includes('SYS_ADMIN') || roles.includes('ADMIN'))) {
                    return NextResponse.redirect(new URL(defaultRolePath, request.url));
                }

                // Manager/Owner değilse /manager rotasına giremez
                if (path.startsWith('/manager') && !(roles.includes('OWNER') || roles.includes('MANAGER'))) {
                    // Belki admin manager sayfalarını da görebilir, iş kuralına göre burası esnetilebilir.
                    // Şimdilik katı kural: Sadece ilgili role sahip olanlar girebilir.
                    return NextResponse.redirect(new URL(defaultRolePath, request.url));
                }

                // Staff değilse /staff rotasına giremez
                if (path.startsWith('/staff') && !roles.includes('STAFF')) {
                    return NextResponse.redirect(new URL(defaultRolePath, request.url));
                }
            }
        } catch (e) {
            console.error("Middleware token decode error:", e);
            // Token bozuksa login'e atarak güvenli kal
            if (isProtectedRoute) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }
    } else if (isAuthRoute && refreshToken && !accessToken) {
        // Refresh token var ama access token yoksa (örn: cookie süresi dolmuş ama session bitmemiş)
        // Normalde client-side veya refresh endpointi bunu çözer ama middleware'de
        // sonsuz döngüye girmemek için dashboard'a atmak mantıklı olabilir.
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};