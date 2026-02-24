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
                    <Alert variant="destructive">
                        <AlertTitle>Eroare de Configurare: Domeniu Neautorizat (-39)</AlertTitle>
                        <AlertDescription>
                            <div className="space-y-2 text-sm">
                                <p>Firebase a blocat cererea deoarece acest domeniu nu este autorizat în Consola Firebase.</p>
                                <ol className="list-decimal list-inside space-y-1 pl-2">
                                    <li>Intrați în <strong>Consola Firebase</strong> &rarr; <strong>Authentication</strong> &rarr; <strong>Settings</strong>.</li>
                                    <li>La tab-ul <strong>Authorized domains</strong>, adăugați domeniul curent (<code>{typeof window !== 'undefined' ? window.location.hostname : '...'}</code>).</li>
                                    <li>Dacă domeniul este deja acolo, asigurați-vă că <strong>Cheia API</strong> din Consola Google Cloud are permisiuni pentru reCAPTCHA Enterprise.</li>
                                </ol>
                                <p className="font-medium pt-2 italic">Această eroare este tehnică și ține de setările proiectului Firebase, nu de codul aplicației.</p>
                            </div>
                        </AlertDescription>
                    </Alert>
                 );
            } else if (err.code === 'auth/invalid-phone-number') {
                setError("Numărul de telefon introdus nu este valid.");
            } else if (err.code === 'auth/too-many-requests') {
                 setError(
                    <Alert variant="destructive">
                        <AlertTitle>Prea multe încercări</AlertTitle>
                        <AlertDescription>
                            <p className="text-sm">Solicitările au fost blocate temporar. Vă rugăm să așteptați câteva minute sau să folosiți un număr de test configurat în consola Firebase.</p>
                        </AlertDescription>
                    </Alert>
                 );
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-center min-h-[80vh]">
             <div id="recaptcha-container" />
             
            <Card className="w-full max-w-sm glass rounded-3xl">
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
                                <div className="mt-4">
                                    {typeof error === 'string' ? (
                                        <Alert variant="destructive">
                                            <AlertTitle>Eroare</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        error
                                    )}
                                </div>
                            )}
                            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground" disabled={isSubmitting}>
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
                                <div className="mt-4">
                                    {typeof error === 'string' ? (
                                        <Alert variant="destructive">
                                            <AlertTitle>Eroare</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        error
                                    )}
                                </div>
                            )}
                            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground" disabled={isSubmitting}>
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