'use client';

import { useActionState } from 'react';
import { loginAction } from '@/modules/auth/server/procedures';
import { OtpForm } from '@/modules/auth/ui/components/otp-form';
import { FormState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const initialLoginState: FormState<{ email: string }> = { success: false, message: '' };

export function LoginView() {
    const [state, action, isPending] = useActionState(loginAction, initialLoginState);

    // Login başarılıysa (OTP gönderildiyse) OtpForm'u göster
    if (state.success && state.payload?.email) {
        return <OtpForm email={state.payload.email} />;
    }

    return (
        <Card className="w-[350px] mx-auto mt-20 shadow-md">
            <CardHeader>
                <CardTitle>Giriş Yap</CardTitle>
                <CardDescription>Email adresinle giriş yap.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="ornek@site.com" />
                        {state.errors?.email && <p className="text-xs text-red-500">{state.errors.email[0]}</p>}
                    </div>

                    {state.message && !state.success && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{state.message}</div>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'OTP Gönder'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center">
                <Link href="/register" className="text-sm text-blue-600 hover:underline">
                    Hesabın yok mu? Kayıt ol
                </Link>
            </CardFooter>
        </Card>
    );
}