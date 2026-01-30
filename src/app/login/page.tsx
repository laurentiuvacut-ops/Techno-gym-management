'use client';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';

export default function LoginPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const auth = useAuth();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);
    
    useEffect(() => {
        if (auth && !recaptchaVerifierRef.current && recaptchaContainerRef.current) {
            // The recaptcha container is invisible, but needs to be in the DOM.
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                'size': 'invisible',
            });
        }
    }, [auth]);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!auth || !recaptchaVerifierRef.current) {
            setError("Autentificarea nu este gata. Reîmprospătează pagina.");
            return;
        }
        setIsSubmitting(true);
        
        const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+40${phoneNumber.replace(/^0/, '')}`;
        
        try {
            const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifierRef.current);
            setConfirmationResult(result);
            setStep('otp');
            setError(null);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/operation-not-allowed') {
                if (err.message.includes('region')) {
                    setError('Configurare necesară. Politica de regiuni SMS trebuie activată în consola Google Cloud (Identity Platform -> Setări).');
                } else if (err.message.includes('SMS')) {
                    setError('Configurare necesară. Vă rugăm să activați API-ul Identity Platform în Google Cloud Console pentru a permite trimiterea de SMS-uri.');
                } else {
                    setError('Eroare de configurare: Autentificarea prin telefon trebuie activată în consola Firebase.');
                }
            } else if (err.code === 'auth/invalid-phone-number') {
              setError('Numărul de telefon nu este valid. Verifică formatul (ex: 0712345678).');
            } else {
              setError("A apărut o eroare la trimiterea codului. Verifică numărul și încearcă din nou.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!confirmationResult) {
            setError("Ceva nu a funcționat. Te rugăm să reîncerci de la pasul 1.");
            return;
        }
        setIsSubmitting(true);

        try {
            await confirmationResult.confirm(otp);
            // Auth state change is handled by the useUser hook, which will trigger redirect.
            router.push('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError("Codul introdus este incorect.");
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
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                        {step === 'phone' ? 'Intră în Cont' : 'Verifică Codul'}
                    </CardTitle>
                    <CardDescription>
                        {step === 'phone' 
                            ? 'Folosește numărul de telefon pentru a te autentifica sau înregistra.' 
                            : `Am trimis un cod de verificare la ${phoneNumber}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 'phone' ? (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div>
                                <Label htmlFor="phone">Număr de Telefon</Label>
                                <Input 
                                    id="phone" 
                                    type="tel" 
                                    placeholder="0712 345 678" 
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Se trimite...' : 'Trimite Cod SMS'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <Label htmlFor="otp">Cod SMS</Label>
                                <Input 
                                    id="otp" 
                                    type="text" 
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Se verifică...' : 'Verifică și Intră'}
                            </Button>
                            <Button variant="link" size="sm" onClick={() => { setStep('phone'); setError(null); }}>
                                Folosește alt număr
                            </Button>
                        </form>
                    )}
                    {error && <p className="text-sm font-medium text-destructive mt-4 text-center">{error}</p>}
                </CardContent>
            </Card>
            {/* This div is used by RecaptchaVerifier and must be in the DOM */}
            <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
        </div>
    );
}
    