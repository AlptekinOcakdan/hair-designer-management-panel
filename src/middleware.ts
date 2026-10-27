import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Backend (jsonwebtoken) token'ları HS256 ile imzalıyor; aynı secret'lar panel .env'inde olmalı.
// Tradeoff: panel secret'ı tutarsa imzalı token üretebilir; ama doğrulanmamış cookie'ye güvenmekten daha güvenli.
async function verifyToken(token: string | undefined, secret: string | undefined) {
    if (!token || !secret) return null;
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
        return payload;
    } catch {
        return null; // imza geçersiz veya süresi dolmuş
    }
}

function redirectToLogin(request: NextRequest) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session_access_token');
    response.cookies.delete('session_refresh_token');
    return response;
}

export async function middleware(request: NextRequest) {
    const refreshTokenCookie = request.cookies.get('session_refresh_token')?.value;
    const accessTokenCookie = request.cookies.get('session_access_token')?.value;

    // Korumalı rotaları genişlettim
    const protectedRoutes = ['/dashboard', '/profile', '/settings', '/admin', '/manager', '/staff'];
    const isProtectedRoute = protectedRoutes.some(path => request.nextUrl.pathname.startsWith(path));

    const authRoutes = ['/login', '/register', '/auth/login', '/auth/register'];
    const isAuthRoute = authRoutes.some(path => request.nextUrl.pathname.startsWith(path));

    // İmzası geçersiz refresh token = çıkış yapılmış; geçersiz/süresi dolmuş access token = yok sayılır
    // (sayfa yüklenir, fetchWithAuth 401 alınca refresh token ile yeniler)
    const refreshToken = (await verifyToken(refreshTokenCookie, process.env.REFRESH_TOKEN_SECRET)) ? refreshTokenCookie : undefined;
    const accessPayload = refreshToken ? await verifyToken(accessTokenCookie, process.env.ACCESS_TOKEN_SECRET) : null;

    // 1. Korumalı rotaya geçerli token olmadan girmeye çalışıyorsa -> Login'e at
    if (isProtectedRoute && !refreshToken) {
        return redirectToLogin(request);
    }

    // Rol tabanlı erişim kontrolü ve yönlendirme mantığı
    if (refreshToken && accessPayload) {
        const roles: string[] = Array.isArray(accessPayload.roles) ? accessPayload.roles : [];

        // Kullanıcının varsayılan ana sayfası (Role göre); bilinmeyen rol -> /login
        let defaultRolePath = '/login';
        if (roles.includes('SYS_ADMIN') || roles.includes('ADMIN')) {
            defaultRolePath = '/admin/organisations';
        } else if (roles.includes('OWNER') || roles.includes('MANAGER')) {
            defaultRolePath = '/manager/dashboard';
        } else if (roles.includes('STAFF')) {
            defaultRolePath = '/staff/appointments';
        }

        // 2. Login/Register sayfasına token varken girmeye çalışıyorsa -> Role göre yönlendir
        if (isAuthRoute && defaultRolePath !== '/login') {
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

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};