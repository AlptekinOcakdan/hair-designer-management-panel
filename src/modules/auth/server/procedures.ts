'use server';

import { createSession, deleteSession, getRefreshToken } from '@/lib/session';
import { redirect } from 'next/navigation';
import {
    FormState
} from "@/lib/definitions";
import dotenv from 'dotenv';
import {LoginSchema, RegisterSchema, VerifyOtpSchema} from "@/modules/auth/types";

dotenv.config({
    path: '.env'
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================================
// REGISTER ACTION
// ============================================================================
export async function registerAction(
    _prevState: FormState<{ email: string }>,
    formData: FormData
): Promise<FormState<{ email: string }>> {

    const validatedFields = RegisterSchema.safeParse({
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
        email: formData.get('email'),
        TOSAccepted: formData.get('TOSAccepted') === 'on',
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Lütfen formu kontrol ediniz.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { firstname, lastname, email, TOSAccepted } = validatedFields.data;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstname, lastname, email, TOSAccepted }),
        });

        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                message: data.message || 'Kayıt işlemi başarısız.'
            };
        }

        return {
            success: true,
            message: 'Kayıt başarılı! OTP kodu gönderildi.',
            payload: { email },
        };

    } catch {
        return {
            success: false,
            message: 'Sunucu bağlantı hatası.',
        };
    }
}

// ============================================================================
// LOGIN ACTION
// ============================================================================
// prevState ve dönüş tipi Generic hale getirildi
export async function loginAction(
    _prevState: FormState<{ email: string }>,
    formData: FormData
): Promise<FormState<{ email: string }>> {

    // 1. Validasyon
    const validatedFields = LoginSchema.safeParse({
        email: formData.get('email'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Lütfen email adresinizi kontrol ediniz.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email } = validatedFields.data;

    try {
        // 2. API İsteği
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                message: data.message || 'Giriş işlemi başarısız. Kullanıcı bulunamadı.'
            };
        }

        // 3. Başarılı
        return {
            success: true,
            message: 'OTP kodu gönderildi.',
            payload: { email }
        };

    } catch (error) {
        console.error('Login action error:', error);
        return {
            success: false,
            message: 'Sunucu hatası oluştu.'
        };
    }
}

// ============================================================================
// VERIFY OTP ACTION
// ============================================================================
// Artık bu da FormData alıyor, böylece useActionState ile kullanılabilir.
export async function verifyOtpAction(
    _prevState: FormState<void>, // Payload'a ihtiyacımız yok, başarılıysa redirect olacak
    formData: FormData
): Promise<FormState<void>> {

    // 1. Validasyon
    const validatedFields = VerifyOtpSchema.safeParse({
        email: formData.get('email'),
        otpCode: formData.get('otpCode'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Geçersiz form verisi.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, otpCode } = validatedFields.data;

    // Yönlendirme yolu varsayılan olarak dashboard
    let redirectPath = '/dashboard';

    try {
        // 2. API İsteği
        const res = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otpCode }),
        });

        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                message: data.message || 'Geçersiz veya süresi dolmuş kod.'
            };
        }

        console.log("OTP verified, received tokens:", data);

        // 3. Token Yazma (Cookie)
        if (data.accessToken && data.user.refreshToken) {
            await createSession(data.accessToken, data.user.refreshToken);

            // 4. Token içeriğinden rolleri okuyarak yönlendirme belirle
            try {
                // JWT'nin payload kısmını (2. kısım) decode et
                const payloadBase64 = data.accessToken.split('.')[1];
                if (payloadBase64) {
                    const buffer = Buffer.from(payloadBase64, 'base64');
                    const payload = JSON.parse(buffer.toString('utf-8'));
                    const roles = payload.roles || [];

                    // Rol önceliğine göre yönlendirme (Admin > Manager > Staff)
                    if (roles.includes('SYS_ADMIN') || roles.includes('ADMIN')) {
                        redirectPath = '/admin/organisations';
                    } else if (roles.includes('OWNER') || roles.includes('MANAGER')) {
                        redirectPath = '/manager/dashboard';
                    } else if (roles.includes('STAFF')) {
                        redirectPath = '/staff/appointments';
                    }
                }
            } catch (decodeError) {
                console.error("Token decoding failed during redirection logic:", decodeError);
                // Hata durumunda varsayılan redirectPath (/dashboard) kullanılır
            }

        } else {
            return {
                success: false,
                message: 'Sunucudan geçersiz yanıt alındı (Token eksik).'
            };
        }

    } catch {
        return {
            success: false,
            message: 'Doğrulama sırasında bağlantı hatası.'
        };
    }

    // 5. Redirect (Try-Catch bloğunun DIŞINDA olmalı)
    redirect(redirectPath);
}

// ============================================================================
// LOGOUT ACTION
// ============================================================================
export async function logoutAction(): Promise<void> {
    const refreshToken = await getRefreshToken();

    if (refreshToken) {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
        } catch (e) {
            console.error("Logout API call failed", e);
        }
    }

    await deleteSession();
    redirect('/auth/login');
}