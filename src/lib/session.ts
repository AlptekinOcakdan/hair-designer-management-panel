import 'server-only';
import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'session_access_token';
const REFRESH_TOKEN_KEY = 'session_refresh_token';

export async function createSession(accessToken: string, refreshToken: string) {
    const cookieStore = await cookies();

    // Access Token (Kısa ömürlü - örn: 15 dk)
    cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 2*60 * 60 // Backend'deki süreyle eşleşmeli
    });

    // Refresh Token (Uzun ömürlü - örn: 7 gün)
    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 // Backend'deki süreyle eşleşmeli
    });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
}

export async function getAccessToken() {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_KEY)?.value;
}

export async function getRefreshToken() {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_KEY)?.value;
}