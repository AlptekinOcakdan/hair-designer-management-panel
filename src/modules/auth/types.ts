import { z } from 'zod';

// --- Register Şeması ---
export const RegisterSchema = z.object({
    firstname: z.string().min(2, { message: 'Ad en az 2 karakter olmalıdır.' }),
    lastname: z.string().min(2, { message: 'Soyad en az 2 karakter olmalıdır.' }),
    email: z.email({ message: 'Geçerli bir email adresi giriniz.' }),
    TOSAccepted: z.boolean().refine((val) => val === true, {
        message: 'Kullanım koşullarını kabul etmelisiniz.',
    }),
});

// --- Login Şeması ---
export const LoginSchema = z.object({
    email: z.email({ message: 'Geçerli bir email adresi giriniz.' }),
});

// --- Verify OTP Şeması (YENİ) ---
export const VerifyOtpSchema = z.object({
    email: z.email({ message: 'Geçerli bir email adresi bulunamadı.' }),
    otpCode: z.string().min(6, { message: 'Kod en az 6 karakter olmalıdır.' }),
});