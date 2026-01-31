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

    // useRef for the verifier instance. This will persist across re-renders.
    const verifierRef = useRef<RecaptchaVerifier | null>(null);
    const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

    // Initialize RecaptchaVerifier only once on component mount.
    useEffect(() => {
        if (!auth || !recaptchaContainerRef.current) return;

        // Check if verifier hasn't been created yet.
        if (!verifierRef.current) {
            // The verifier is attached to the div via the ref.
            verifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                'size': 'invisible',
                'callback': () => {
                    // This callback is for when the reCAPTCHA is solved successfully.
                    // For invisible reCAPTCHA, this is often handled by the signIn call itself.
                },
                'expired-callback': () => {
                    // Response expired. Ask user to solve reCAPTCHA again.
                    setError("Verificarea reCAPTCHA a expirat. Vă rugăm să încercați din nou.");
                }
            });
        }

        // The cleanup function will be called when the component unmounts.
        return () => {
            if (verifierRef.current) {
                verifierRef.current.clear();
                verifierRef.current = null;
            }
        };
    }, [auth]); // Only re-run if auth instance changes.


    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);


    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const verifier = verifierRef.current;
        if (!verifier) {
            setError("reCAPTCHA nu s-a putut inițializa. Vă rugăm reîncărcați pagina.");
            setIsSubmitting(false);
            return;
        }

        const formattedPhoneNumber = `+40${phoneNumber.replace(/\s/g, '')}`;

        try {
            // signInWithPhoneNumber will trigger the invisible reCAPTCHA.
            const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, verifier);
            setConfirmationResult(result);
            setStep('otp');
            setError(null);
        } catch (err: any) {
            console.error("Firebase signInWithPhoneNumber Error:", err);
            
            // In case of an error, it's often best to reset the reCAPTCHA widget.
            // This is safer than accessing the global grecaptcha object directly.
            if (verifierRef.current) {
                verifierRef.current.render().catch(console.error); // Try to re-render it.
            }

            const errorCode = err.code || 'UNKNOWN_ERROR';
            const errorMessage = err.message || 'A apărut o eroare neașteptată.';
            setError(`Eroare (${errorCode}): ${errorMessage}. Vă rugăm verificați consola pentru mai multe detalii și contactați suportul dacă problema persistă.`);

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
             {/* This container is now attached via a ref and must always be in the DOM */}
             <div ref={recaptchaContainerRef} />
             
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
