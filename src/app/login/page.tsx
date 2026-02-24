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
            // Curățăm orice verifier existent pentru a evita erorile de re-inițializare
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                delete window.recaptchaVerifier;
            }
            
            const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved
                },
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
            
            // Eroarea -39 sau app-not-authorized indică un domeniu care nu este în Authorized Domains în Firebase
            if (err.code === 'auth/requests-from-referer' || err.code === 'auth/app-not-authorized' || err.message?.includes('-39')) {
                 setError(
                    <Alert variant="destructive" className="border-primary/50 bg-primary/5">
                        <AlertTitle className="text-primary font-bold">Eroare de Autorizare (-39)</AlertTitle>
                        <AlertDescription className="text-xs space-y-2 mt-2">
                            <p>Această eroare apare deoarece domeniul curent nu este autorizat în Firebase.</p>
                            <p><strong>Soluție Admin:</strong> Accesați Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains și adăugați: <code>{typeof window !== 'undefined' ? window.location.hostname : 'domeniul dvs.'}</code></p>
                            <p className="mt-2 text-[10px] opacity-70">Notă: Nu are legătură cu abonamentul utilizatorului.</p>
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
            setError("Sesiunea a expirat. Vă rugăm să reîncepeți procesul.");
            setStep('phone');
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
            console.error('Verify Error:', err);
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
        <div className="flex items-center justify-center min-h-[80vh] bg-background p-4">
             {/* Container ascuns pentru reCAPTCHA */}
             <div id="recaptcha-container" />
             
            <Card className="w-full max-w-sm glass rounded-3xl border-border/30 overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex justify-center mb-6">
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
                            <CardTitle className="text-2xl text-center font-headline uppercase tracking-wider">Bun venit</CardTitle>
                            <CardDescription className="text-center text-xs">
                                Introdu numărul de telefon pentru a primi codul de acces.
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <CardTitle className="text-2xl text-center font-headline uppercase tracking-wider">Verificare</CardTitle>
                            <CardDescription className="text-center text-xs">
                                Am trimis un cod prin SMS la numărul tău.
                            </CardDescription>
                        </>
                    )}
                </CardHeader>
                {step === 'phone' ? (
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs uppercase tracking-widest opacity-70">Telefon</Label>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 h-10 rounded-l-xl border border-r-0 border-input bg-muted/20 text-sm text-muted-foreground font-bold">+40</span>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="7xx xxx xxx"
                                        required
                                        className="rounded-l-none rounded-r-xl h-10 bg-background/50"
                                    />
                                </div>
                            </div>
                            {error && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                    {typeof error === 'string' ? (
                                        <Alert variant="destructive" className="py-2 border-destructive/20 bg-destructive/5">
                                            <AlertDescription className="text-[11px] leading-tight">{error}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        error
                                    )}
                                </div>
                            )}
                            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/20" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        <span>Se trimite...</span>
                                    </div>
                                ) : 'Trimite Cod'}
                            </Button>
                        </form>
                    </CardContent>
                ) : (
                    <CardContent className="space-y-4">
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div className="space-y-2 text-center">
                                <Label htmlFor="otp" className="text-xs uppercase tracking-widest opacity-70">Codul de 6 cifre</Label>
                                <Input
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    required
                                    maxLength={6}
                                    className="text-center tracking-[0.5em] text-xl font-bold h-14 bg-background/50 rounded-xl"
                                />
                            </div>
                             {error && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                    {typeof error === 'string' ? (
                                        <Alert variant="destructive" className="py-2 border-destructive/20 bg-destructive/5">
                                            <AlertDescription className="text-[11px] leading-tight">{error}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        error
                                    )}
                                </div>
                            )}
                            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/20" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        <span>Se verifică...</span>
                                    </div>
                                ) : 'Confirmă Accesul'}
                            </Button>
                            <Button variant="link" onClick={() => { setStep('phone'); setError(null); setConfirmationResult(null); }} className="w-full text-muted-foreground text-[10px] uppercase tracking-widest">
                                Folosește alt număr
                            </Button>
                        </form>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
