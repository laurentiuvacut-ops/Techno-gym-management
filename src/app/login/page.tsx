'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, getAdditionalUserInfo } from 'firebase/auth';
import { useUser, useAuth } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image';
import Link from 'next/link';

// Extend the Window interface to avoid TypeScript errors when attaching the verifier.
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function LoginPage() {
    const { user, isUserLoading: loading } = useUser();
    const router = useRouter();
    const auth = useAuth();
    
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);
    
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
            
            const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {},
                'expired-callback': () => {
                   setError("Verificarea reCAPTCHA a expirat. Vă rugăm să reîncercați.");
                }
            });
            window.recaptchaVerifier = verifier;

            const formattedPhoneNumber = `+40${phoneNumber.replace(/\s/g, '')}`;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, verifier);
            setConfirmationResult(confirmation);
            setStep('otp');
            setError(null);
        } catch (err: any) {
            console.error('Login Error:', err);
            
             if (err.code === 'auth/requests-from-referer' || err.code === 'auth/app-not-authorized' || err.message?.includes('-39')) {
                 setError(
                    <Alert variant="destructive" className="border-primary/50 bg-primary/5">
                        <AlertTitle className="text-primary font-bold">Eroare Tehnică de Autorizare (-39)</AlertTitle>
                        <AlertDescription className="text-xs space-y-2 mt-2">
                            <p>Această eroare NU este legată de abonament. Ea apare deoarece browserul/domeniul nu este autorizat în Consola Firebase.</p>
                            <p><strong>Soluție pentru Admin:</strong> Adăugați <code>{typeof window !== 'undefined' ? window.location.hostname : 'domeniul curent'}</code> în Firebase Console &rarr; Auth &rarr; Settings &rarr; Authorized domains.</p>
                        </AlertDescription>
                    </Alert>
                 );
            } else if (err.code === 'auth/invalid-phone-number') {
                setError("Numărul de telefon introdus nu este valid.");
            } else if (err.code === 'auth/too-many-requests') {
                 setError("Prea multe încercări. Vă rugăm să așteptați câteva minute.");
            } else {
                setError(`Eroare: ${err.message || 'A apărut o eroare neașteptată.'}`);
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
            const userCredential = await confirmationResult.confirm(otp);
            const additionalUserInfo = getAdditionalUserInfo(userCredential);

            if (additionalUserInfo?.isNewUser) {
                router.push('/register');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            if (err.code === 'auth/invalid-verification-code' || err.code === 'auth/code-expired') {
                setError('Codul introdus este invalid sau a expirat.');
            } else {
                setError(`Eroare la verificare: ${err.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-background">
             <div id="recaptcha-container" />
             
            <Card className="w-full max-w-sm glass rounded-3xl border-border/30">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Link href="/" className="flex items-center gap-2">
                           <div className="relative w-10 h-10">
                            <Image 
                              src="https://i.imgur.com/9W1ye1w.png" 
                              alt="Techno Gym Logo" 
                              fill
                              className="object-contain"
                            />
                           </div>
                           <span className="text-2xl font-bold tracking-tight text-gradient">TECHNO GYM</span>
                        </Link>
                    </div>
                    {step === 'phone' ? (
                        <>
                            <CardTitle className="text-2xl text-center font-headline uppercase tracking-wider">Intră în Cont</CardTitle>
                            <CardDescription className="text-center">
                                Introdu numărul de telefon pentru a primi un cod de verificare.
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <CardTitle className="text-2xl text-center font-headline uppercase tracking-wider">Verifică Codul</CardTitle>
                            <CardDescription className="text-center">
                                Am trimis un cod de 6 cifre la numărul tău de telefon.
                            </CardDescription>
                        </>
                    )}
                </CardHeader>
                {step === 'phone' ? (
                    <CardContent>
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Număr de Telefon</Label>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted/20 text-sm text-muted-foreground">+40</span>
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
                                <div className="mt-2">
                                    {typeof error === 'string' ? (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertDescription className="text-xs">{error}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        error
                                    )}
                                </div>
                            )}
                            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-bold" disabled={isSubmitting}>
                                {isSubmitting ? 'Se trimite...' : 'Trimite Cod'}
                            </Button>
                        </form>
                    </CardContent>
                ) : (
                    <CardContent>
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Cod de Verificare</Label>
                                <Input
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    required
                                    maxLength={6}
                                    className="text-center tracking-[0.5em] text-lg font-bold"
                                />
                            </div>
                             {error && (
                                <div className="mt-2">
                                    {typeof error === 'string' ? (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertDescription className="text-xs">{error}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        error
                                    )}
                                </div>
                            )}
                            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-bold" disabled={isSubmitting}>
                                {isSubmitting ? 'Se verifică...' : 'Verifică'}
                            </Button>
                            <Button variant="link" onClick={() => { setStep('phone'); setError(null); setConfirmationResult(null); }} className="w-full text-muted-foreground text-xs">
                                Folosește alt număr de telefon
                            </Button>
                        </form>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
