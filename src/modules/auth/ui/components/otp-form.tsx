'use client';

import { useActionState } from 'react';
import { verifyOtpAction } from '@/modules/auth/server/procedures';
import { FormState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";

interface OtpFormProps {
    email: string;
}

const initialOtpState: FormState<void> = { success: false, message: '' };

export function OtpForm({ email }: OtpFormProps) {
    const [state, action, isPending] = useActionState(verifyOtpAction, initialOtpState);

    return (
        <Card className="w-[350px] mx-auto mt-20 shadow-md animate-in fade-in zoom-in duration-300">
            <CardHeader>
                <CardTitle className="text-center">Doğrulama Kodu</CardTitle>
                <CardDescription className="text-center">
                    <span className="font-medium text-foreground">{email}</span> adresine gönderilen kodu giriniz.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-6">
                    {/* Email'i gizli taşıyoruz */}
                    <input type="hidden" name="email" value={email} />

                    <div className="flex flex-col items-center space-y-4">
                        <Label htmlFor="otpCode" className="sr-only">OTP Kodu</Label>

                        {/* Shadcn InputOTP Bileşeni */}
                        {/* name="otpCode" vermemiz Server Action'ın bunu yakalaması için YETERLİDİR. */}
                        <InputOTP maxLength={6} name="otpCode">
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>

                        {state.errors?.otpCode && (
                            <p className="text-xs text-red-500 font-medium animate-pulse">
                                {state.errors.otpCode[0]}
                            </p>
                        )}
                    </div>

                    {state.message && !state.success && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded text-center border border-red-200">
                            {state.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Doğrula'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}