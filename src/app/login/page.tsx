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

    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use a ref for the verifier instance
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

    // This useEffect handles the lifecycle of the reCAPTCHA verifier
    useEffect(() => {
        // If auth is not ready, do nothing.
        if (!auth) return;

        // Create the verifier instance once.
        // We use an ID string for the container, which is simpler and more reliable.
        if (!recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // This callback is called when the reCAPTCHA is successfully solved.
                    // The `signInWithPhoneNumber` function will be called after this.
                }
            });
        }

        // Cleanup function to clear the reCAPTCHA when the component unmounts.
        // This is crucial to prevent memory leaks and errors.
        return () => {
            recaptchaVerifierRef.current?.clear();
        };
    }, [auth]);


    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);


    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const verifier = recaptchaVerifierRef.current;
        if (!verifier) {
            setError("reCAPTCHA nu s-a putut inițializa. Vă rugăm reîncărcați pagina.");
            setIsSubmitting(false);
            return;
        }

        const formattedPhoneNumber = `+40${phoneNumber.replace(/\s/g, '')}`;

        try {
            const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, verifier);
            setConfirmationResult(result);
            setStep('otp');
            setError(null);
        } catch (err: any) {
            console.error("Firebase signInWithPhoneNumber Error:", err);
            // Reset the reCAPTCHA widget in case of an error.
            // This can help resolve issues where the widget gets into a bad state.
            (window as any).grecaptcha?.reset();

            if (err.code === 'auth/invalid-phone-number') {
                setError('Numărul de telefon introdus nu este valid.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Prea multe încercări. Vă rugăm încercați din nou mai târziu.');
            } else if (err.code === 'auth/operation-not-allowed') {
                 setError('Eroare de configurare. Asigurați-vă că politica SMS este activată în Google Cloud. Contactați suportul dacă problema persistă.');
            } else {
                setError(`A apărut o eroare neașteptată. Vă rugăm reîncărcați pagina. (${err.code || 'UNKNOWN_ERROR'})`);
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
            setError("A apărut o eroare. Vă rugăm să reîncercați de la început.");
            setIsSubmitting(false);
            return;
        }
        try {
            await confirmationResult.confirm(otp);
            // onAuthStateChanged will handle the redirect to /dashboard
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-verification-code' || err.code === 'auth/code-expired') {
                setError('Codul introdus este invalid sau a expirat.');
            } else {
                setError('A apărut o eroare la verificarea codului.');
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
             {/* The reCAPTCHA container must always be in the DOM. */}
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
                            <Button variant="link" onClick={() => { setStep('phone'); setError(null); }} className="w-full">
                                Folosește alt număr de telefon
                            </Button>
                        </form>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
