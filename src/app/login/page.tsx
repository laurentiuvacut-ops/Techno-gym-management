'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, getAdditionalUserInfo } from 'firebase/auth';
import { useUser, useAuth } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image';
import Link from 'next/link';
import { RefreshCcw, WifiOff, Clock, ShieldCheck } from 'lucide-react';

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
    const [step, setStep] = useState('phone');
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const initRecaptcha = () => {
        if (!auth) return;
        
        // Curățăm orice instanță veche pentru a evita eroarea "container already has a verifier"
        if (window.recaptchaVerifier) {
            try { 
                window.recaptchaVerifier.clear(); 
            } catch(e) {
                console.warn("Recaptcha clear warning:", e);
            }
            window.recaptchaVerifier = undefined;
            const container = document.getElementById('recaptcha-container');
            if (container) container.innerHTML = '';
        }

        try {
            const container = document.getElementById('recaptcha-container');
            if (!container) return;

            // Folosim dimensiunea 'normal' (vizibilă) pentru a declanșa corect "reCAPTCHA SMS Defense"
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'normal',
                'callback': () => {
                    setError(null);
                    console.log("reCAPTCHA solved");
                },
                'expired-callback': () => {
                    setError("Verificarea a expirat. Te rugăm să bifezi din nou.");
                }
            });

            window.recaptchaVerifier.render().catch(err => {
                console.error("reCAPTCHA render error:", err);
            });
        } catch (err) {
            console.error("Recaptcha Init Error:", err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(initRecaptcha, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [auth, step]);

    const handleHardReset = async () => {
        setIsSubmitting(true);
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                }
            }
            window.localStorage.clear();
            window.sessionStorage.clear();
            if ('caches' in window) {
                const keys = await caches.keys();
                for (let key of keys) {
                    await caches.delete(key);
                }
            }
        } catch (e) {}
        window.location.reload();
    };
    
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!window.recaptchaVerifier) {
            initRecaptcha();
            setError("Se inițializează securitatea...");
            setIsSubmitting(false);
            return;
        }

        try {
            const cleanPhone = phoneNumber.replace(/\s/g, '').replace(/^(\+40|40|0)/, '');
            const formattedPhoneNumber = `+40${cleanPhone}`;
            
            // Această funcție va folosi acum "reCAPTCHA SMS Defense" dacă e activat în consolă
            const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setStep('otp');
            setError(null);
        } catch (err: any) {
            console.error('Login Error:', err);
            
            if (err.code === 'auth/too-many-requests') {
                setError(
                    <Alert variant="destructive" className="bg-destructive/10">
                        <AlertTitle className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Prea multe încercări
                        </AlertTitle>
                        <AlertDescription className="text-xs mt-2">
                            Ai solicitat prea multe coduri. Te rugăm să aștepți <strong>10-15 minute</strong>. Google a blocat temporar numărul pentru siguranță.
                        </AlertDescription>
                    </Alert>
                );
            } else if (
                err.code === 'auth/operation-not-allowed' || 
                err.code === 'auth/requests-from-referer' || 
                err.message?.includes('-39') ||
                err.message?.includes('operation-not-allowed')
            ) {
                 setError(
                    <Alert variant="destructive" className="border-primary/50 bg-primary/5">
                        <AlertTitle className="text-primary font-bold flex items-center gap-2">
                            <WifiOff className="w-4 h-4" /> Blocaj Rețea (Digi/ISP)
                        </AlertTitle>
                        <AlertDescription className="text-xs space-y-3 mt-2">
                            <p>Furnizorul tău de internet blochează procesul de verificare SMS.</p>
                            <p className="font-bold text-primary">Soluție:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Asigură-te că bifezi căsuța <strong>"I'm not a robot"</strong>.</li>
                                <li>Dacă eroarea persistă, apasă butonul de <strong>Resetare</strong> de mai jos.</li>
                            </ul>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full h-10 text-[10px] gap-2 border-primary/30 font-bold uppercase mt-2"
                                onClick={handleHardReset}
                            >
                                <RefreshCcw className="w-3 h-3" />
                                Resetare Conexiune Aplicație
                            </Button>
                        </AlertDescription>
                    </Alert>
                 );
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
            setError("Sesiunea a expirat. Reîncepeți procesul.");
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
            setError('Codul este invalid sau a expirat.');
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
            <Card className="w-full max-w-sm glass rounded-3xl border-border/30 overflow-hidden shadow-2xl">
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

                            <div className="flex justify-center py-2 min-h-[80px]">
                                <div id="recaptcha-container" className="scale-90 origin-center" />
                            </div>

                            {error && <div className="animate-in fade-in duration-200">{error}</div>}
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-primary text-primary-foreground font-bold h-12 rounded-xl" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Se verifică...' : 'Trimite Cod'}
                            </Button>
                            
                            <div className="flex items-center justify-center gap-2 py-2">
                                <ShieldCheck className="w-4 h-4 text-primary/50" />
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Securizat prin reCAPTCHA Defense</span>
                            </div>
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
                                {isSubmitting ? 'Se confirmă...' : 'Confirmă Accesul'}
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
