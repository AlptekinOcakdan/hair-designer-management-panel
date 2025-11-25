'use client';

import { useActionState } from 'react';
import { registerAction } from '@/modules/auth/server/procedures'; // Server Procedures
import { OtpForm } from '@/modules/auth/ui/components/otp-form';  // Local Auth Component
import { FormState } from '@/lib/definitions';
import { Button } from '@/components/ui/button'; // Global Shadcn
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const initialRegisterState: FormState<{ email: string }> = { success: false, message: '' };

export function RegisterView() {
    const [state, action, isPending] = useActionState(registerAction, initialRegisterState);

    // Payload varsa (Kayıt başarılıysa) direkt OTP Form bileşenini göster
    if (state.success && state.payload?.email) {
        return <OtpForm email={state.payload.email} />;
    }

    return (
        <Card className="w-[400px] mx-auto mt-20 shadow-lg">
            <CardHeader>
                <CardTitle>Kayıt Ol</CardTitle>
                <CardDescription>Yeni bir hesap oluştur.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstname">Ad</Label>
                            <Input id="firstname" name="firstname" placeholder="Ad" />
                            {state.errors?.firstname && <p className="text-xs text-red-500">{state.errors.firstname[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastname">Soyad</Label>
                            <Input id="lastname" name="lastname" placeholder="Soyad" />
                            {state.errors?.lastname && <p className="text-xs text-red-500">{state.errors.lastname[0]}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="ornek@site.com" />
                        {state.errors?.email && <p className="text-xs text-red-500">{state.errors.email[0]}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="TOSAccepted" name="TOSAccepted" value="on" />
                        <label htmlFor="TOSAccepted" className="text-sm font-medium leading-none">
                            Kullanım koşullarını kabul ediyorum
                        </label>
                    </div>
                    {state.errors?.TOSAccepted && <p className="text-xs text-red-500">{state.errors.TOSAccepted[0]}</p>}

                    {state.message && !state.success && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{state.message}</div>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Kayıt Ol'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center">
                <Link href="/login" className="text-sm text-blue-600 hover:underline">
                    Zaten hesabın var mı? Giriş yap
                </Link>
            </CardFooter>
        </Card>
    );
}