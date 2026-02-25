
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { RefreshCcw, ShieldCheck } from 'lucide-react';

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
    const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);
    
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const recaptchaWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    // Initialize reCAPTCHA verifier with a more robust check
    useEffect(() => {
        if (!auth) return;

        const initRecaptcha = () => {
            // Curățăm orice instanță veche
            if (window.recaptchaVerifier) {
                try { 
                    window.recaptchaVerifier.clear(); 
                } catch(e) {}
                window.recaptchaVerifier = undefined;
            }

            try {
                // Verificăm dacă elementul există în DOM
                const container = document.getElementById('recaptcha-container');
                if (!container) {
                    console.warn("Container reCAPTCHA negăsit, reîncercăm...");
                    setTimeout(initRecaptcha, 500);
                    return;
                }

                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {
                        console.log('reCAPTCHA solved');
                    },
                    'expired-callback': () => {
                        setError("Verificarea de securitate a expirat. Vă rugăm să reîncercați.");
                    }
                });

                // Forțăm o randare invizibilă pentru a valida domeniul imediat
                window.recaptchaVerifier.render().then(() => {
                    setIsRecaptchaReady(true);
                    console.log("reCAPTCHA inițializat cu succes.");
                }).catch(err => {
                    console.error("Eroare la randarea reCAPTCHA:", err);
                    // Dacă e eroare de domeniu, o prindem aici
                });

            } catch (err) {
                console.error("Recaptcha Init Error:", err);
            }
        };

        // Mică întârziere pentru a ne asigura că DOM-ul e gata
        const timer = setTimeout(initRecaptcha, 1000);

        return () => {
            clearTimeout(timer);
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch(e) {}
                window.recaptchaVerifier = undefined;
            }
        };
    }, [auth]);
    
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!window.recaptchaVerifier) {
            setError(
                <div className="space-y-3">
                    <p>Sistemul de securitate nu s-a putut inițializa.</p>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-[10px] gap-2"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCcw className="w-3 h-3" />
                        REÎNCARCĂ PAGINA
                    </Button>
                </div>
            );
            setIsSubmitting(false);
            return;
        }

        try {
            const formattedPhoneNumber = `+40${phoneNumber.replace(/\s/g, '')}`;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setStep('otp');
            setError(null);
        } catch (err: any) {
            console.error('Login Error:', err);
            
            const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'necunoscut';
            const isDomainError = err.code === 'auth/requests-from-referer' || 
                                err.code === 'auth/app-not-authorized' || 
                                err.message?.includes('-39') ||
                                err.message?.includes('auth/requests-from-referer');

            if (isDomainError) {
                 setError(
                    <Alert variant="destructive" className="border-primary/50 bg-primary/5">
                        <AlertTitle className="text-primary font-bold flex items-center gap-2">
                            Eroare de Autorizare Domeniu
                        </AlertTitle>
                        <AlertDescription className="text-xs space-y-3 mt-2">
                            <p>Domeniul <strong>{currentHostname}</strong> nu a putut fi validat de Firebase. Acest lucru se întâmplă uneori din cauza cache-ului browser-ului.</p>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full h-8 text-[10px] gap-2 border-primary/30 hover:bg-primary/10"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCcw className="w-3 h-3" />
                                REÎNCARCĂ PAGINA (GOLIRE CACHE)
                            </Button>
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
             {/* Container pentru reCAPTCHA - mutat în afara oricărei condiții logice */}
             <div id="recaptcha-container" className="fixed bottom-0 left-0 pointer-events-none opacity-0" />
             
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
                                        className="rounded-l-none rounded-r-xl h-10 bg-background/50 text-base"
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
                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-primary text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/20" 
                                disabled={isSubmitting || (!isRecaptchaReady && phoneNumber.length > 5)}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        <span>Se trimite...</span>
                                    </div>
                                ) : isRecaptchaReady ? 'Trimite Cod' : (
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 animate-pulse" />
                                        <span>Se securizează...</span>
                                    </div>
                                )}
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
