'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useUser } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image';

export default function LoginPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const auth = getAuth();
    
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);
    
    useEffect(() => {
        if (!auth || recaptchaVerifierRef.current) return;

        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {
                // reCAPTCHA solved
            },
            'expired-callback': () => {
               setError("Verificarea reCAPTCHA a expirat. Vă rugăm să reîncercați.");
            }
        });
        
        recaptchaVerifierRef.current = verifier;

    }, [auth]);


    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const verifier = recaptchaVerifierRef.current;
        if (!verifier) {
            setError("Recaptcha verifier nu este inițializat. Vă rugăm reîncărcați pagina.");
            setIsSubmitting(false);
            return;
        }

        const formattedPhoneNumber = `+40${phoneNumber.replace(/\s/g, '')}`;

        try {
            const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, verifier);
            setConfirmationResult(confirmation);
            setStep('otp');
            setError(null);
        } catch (err: any) {
            console.error("Firebase signInWithPhoneNumber Error:", err);
            const errorCode = err.code || 'UNKNOWN_ERROR';
            const errorMessage = err.message || 'A apărut o eroare neașteptată.';
            setError(`Eroare la trimiterea codului (${errorCode}): ${errorMessage}. Asigurați-vă că domeniul este autorizat și cheia reCAPTCHA este corectă.`);
            
            try {
                // @ts-ignore
                const widgetId = verifier.widgetId;
                if (typeof window !== 'undefined' && (window as any).grecaptcha) {
                    (window as any).grecaptcha.reset(widgetId);
                }
            } catch (resetError) {
                console.error("Error resetting reCAPTCHA:", resetError);
            }

        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        
        if (!confirmationResult) {
            setError("A apărut o eroare de sesiune. Vă rugăm să reîncercați de la început.");
            setIsSubmitting(false);
            return;
        }

        try {
            await confirmationResult.confirm(otp);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-verification-code' || err.code === 'auth/code-expired') {
                setError('Codul introdus este invalid sau a expirat.');
            } else {
                const errorCode = err.code || 'UNKNOWN_ERROR';
                const errorMessage = err.message || 'A apărut o eroare la verificarea codului.';
                setError(`Eroare (${errorCode}): ${errorMessage}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-center min-h-[80vh]">
             <div id="recaptcha-container" />
             
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Image src="https://i.imgur.com/QdArxUJ.png" alt="Techno Gym Logo" width={48} height={48} />
                    </div>
                    {step === 'phone' ? (
                        <>
                            <CardTitle className="text-2xl text-center">Intră în Cont</CardTitle>
                            <CardDescription className="text-center">
                                Introdu numărul de telefon pentru a primi un cod de verificare.
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <CardTitle className="text-2xl text-center">Verifică Codul</CardTitle>
                            <CardDescription className="text-center">
                                Am trimis un cod de 6 cifre la numărul tău de telefon.
                            </CardDescription>
                        </>
                    )}
                </CardHeader>
                {step === 'phone' ? (
                    <CardContent>
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div>
                                <Label htmlFor="phone">Număr de Telefon</Label>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-background text-sm text-muted-foreground">+40</span>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="712 345 678"
                                        required
                                        className="rounded-l-none"
                                    />
                                </div>
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Eroare</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Se trimite...' : 'Trimite Cod'}
                            </Button>
                        </form>
                    </CardContent>
                ) : (
                    <CardContent>
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div>
                                <Label htmlFor="otp">Cod de Verificare</Label>
                                <Input
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    required
                                    maxLength={6}
                                />
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Eroare</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Se verifică...' : 'Verifică'}
                            </Button>
                            <Button variant="link" onClick={() => { setStep('phone'); setError(null); setConfirmationResult(null); }} className="w-full">
                                Folosește alt număr de telefon
                            </Button>
                        </form>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
