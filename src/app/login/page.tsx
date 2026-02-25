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
import { RefreshCcw, ShieldCheck, AlertTriangle } from 'lucide-react';

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

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    // Initialize reCAPTCHA verifier
    useEffect(() => {
        if (!auth) return;

        const initRecaptcha = () => {
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch(e) {}
                window.recaptchaVerifier = undefined;
            }

            try {
                const container = document.getElementById('recaptcha-container');
                if (!container) {
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

                window.recaptchaVerifier.render().then(() => {
                    setIsRecaptchaReady(true);
                }).catch(err => {
                    console.error("reCAPTCHA render error:", err);
                });

            } catch (err) {
                console.error("Recaptcha Init Error:", err);
            }
        };

        const timer = setTimeout(initRecaptcha, 1000);
        return () => {
            clearTimeout(timer);
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch(e) {}
                window.recaptchaVerifier = undefined;
            }
        };
    }, [auth]);

    // Funcție pentru a curăța Service Worker-ul și cache-ul (rezolvă erorile persistente de domeniu)
    const handleHardReset = async () => {
        setIsSubmitting(true);
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
        }
        
        if ('caches' in window) {
            const keys = await caches.keys();
            for (let key of keys) {
                await caches.delete(key);
            }
        }
        
        window.location.reload();
    };
    
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!window.recaptchaVerifier) {
            setError(
                <div className="space-y-3">
                    <p>Sistemul de securitate nu s-a putut inițializa.</p>
                    <Button variant="outline" size="sm" className="w-full text-[10px]" onClick={() => window.location.reload()}>
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
                                err.message?.includes('referer');

            if (isDomainError) {
                 setError(
                    <Alert variant="destructive" className="border-primary/50 bg-primary/5">
                        <AlertTitle className="text-primary font-bold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Eroare Autorizare
                        </AlertTitle>
                        <AlertDescription className="text-xs space-y-3 mt-2">
                            <p>Browserul tău folosește o versiune veche a site-ului stocată în memorie (Cache).</p>
                            <div className="p-2 bg-black/20 rounded border border-white/10 text-[10px]">
                                Domeniu: {currentHostname}
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full h-8 text-[10px] gap-2 border-primary/30"
                                onClick={handleHardReset}
                            >
                                <RefreshCcw className="w-3 h-3" />
                                RESETEAZĂ ȘI REÎNCARCĂ
                            </Button>
                        </AlertDescription>
                    </Alert>
                 );
            } else if (err.code === 'auth/invalid-phone-number') {
                setError("Numărul de telefon introdus nu este valid.");
            } else if (err.code === 'auth/too-many-requests') {
                 setError("Prea multe încercări. Vă rugăm să așteptați câteva minute.");
            } else {
                setError(`Eroare: ${err.message || 'A apărut o eroare.'}`);
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
            setError("Sesiunea a expirat.");
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
            setError('Codul introdus este invalid sau a expirat.');
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
        <div className="flex items-center justify-center min-h-[80vh] bg-background p-4">
             <div id="recaptcha-container" className="fixed bottom-0 left-0 pointer-events-none opacity-0" />
             
            <Card className="w-full max-w-sm glass rounded-3xl border-border/30 overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex justify-center mb-6">
                        <Link href="/" className="flex items-center gap-2">
                           <div className="relative w-10 h-10">
                            <Image src="https://i.imgur.com/9W1ye1w.png" alt="Logo" fill className="object-contain" />
                           </div>
                           <span className="text-2xl font-bold tracking-tight text-gradient">TECHNO GYM</span>
                        </Link>
                    </div>
                    <CardTitle className="text-2xl text-center font-headline uppercase tracking-wider">
                        {step === 'phone' ? 'Bun venit' : 'Verificare'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === 'phone' ? (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs uppercase tracking-widest opacity-70">Telefon</Label>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 h-10 rounded-l-xl border border-r-0 border-input bg-muted/20 text-sm font-bold">+40</span>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="7xx xxx xxx"
                                        required
                                        className="rounded-l-none rounded-r-xl h-10 text-base"
                                    />
                                </div>
                            </div>
                            {error && <div className="animate-in fade-in duration-200">{error}</div>}
                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-primary text-primary-foreground font-bold h-12 rounded-xl" 
                                disabled={isSubmitting || (!isRecaptchaReady && phoneNumber.length > 5)}
                            >
                                {isSubmitting ? 'Se trimite...' : isRecaptchaReady ? 'Trimite Cod' : 'Securizare...'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div className="space-y-2 text-center">
                                <Label htmlFor="otp" className="text-xs uppercase tracking-widest opacity-70">Codul primit</Label>
                                <Input
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    required
                                    maxLength={6}
                                    className="text-center tracking-[0.5em] text-xl font-bold h-14 bg-background/50"
                                />
                            </div>
                            {error && <div className="animate-in fade-in duration-200">{error}</div>}
                            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-bold h-12 rounded-xl" disabled={isSubmitting}>
                                {isSubmitting ? 'Se verifică...' : 'Confirmă Accesul'}
                            </Button>
                            <Button variant="link" onClick={() => { setStep('phone'); setError(null); }} className="w-full text-muted-foreground text-[10px] uppercase">
                                Alt număr
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
