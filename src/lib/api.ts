import 'server-only';
import { getAccessToken, getRefreshToken, createSession, deleteSession } from './session';
import dotenv from 'dotenv';

dotenv.config({
    path: '.env'
});

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Express API URL

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export async function fetchWithAuth(endpoint: string, options: FetchOptions = {}) {
    const token = await getAccessToken();

    // Header'ları hazırla
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    let response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Eğer 401 dönerse Token Refresh dene
    if (response.status === 401) {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            // Refresh token yoksa oturumu sil
            await deleteSession();
            return response; // 401 döndür
        }

        // Backend'deki /auth/refresh-token endpoint'ine istek
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            // Yeni tokenları cookie'ye yaz
            await createSession(data.accessToken, data.refreshToken);

            // Orijinal isteği yeni token ile tekrarla
            const newHeaders = {
                ...headers,
                Authorization: `Bearer ${data.accessToken}`,
            };

            response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: newHeaders,
            });
        } else {
            // Refresh token da geçersizse çıkış yap
            await deleteSession();
        }
    }

    return response;
}
