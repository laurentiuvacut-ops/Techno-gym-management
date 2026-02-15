'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { debugResendConfig, type DebugResendOutput } from '@/ai/flows/debug-resend';
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

function StatusIndicator({ status, label, details }: { status: boolean | null, label: string, details: string }) {
    const Icon = status === true ? CheckCircle : (status === false ? AlertTriangle : HelpCircle);
    const color = status === true ? 'text-success' : (status === false ? 'text-destructive' : 'text-muted-foreground');

    return (
        <div className="flex items-start gap-4 p-4 rounded-lg bg-foreground/5">
            <Icon className={`mt-1 h-5 w-5 shrink-0 ${color}`} />
            <div>
                <p className={`font-semibold ${color}`}>{label}</p>
                <p className="text-sm text-muted-foreground">{details}</p>
            </div>
        </div>
    );
}

export default function DebugResendPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<DebugResendOutput | null>(null);

    const handleRunTest = async () => {
        setIsLoading(true);
        setResults(null);
        const res = await debugResendConfig();
        setResults(res);
        setIsLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <Button asChild variant="outline" className="w-fit">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Înapoi la Panou
                </Link>
            </Button>
            <Card className="glass">
                <CardHeader>
                    <CardTitle>Diagnosticare Configurare E-mail (Resend)</CardTitle>
                    <CardDescription>
                        Acest test verifică dacă variabilele de mediu sunt setate corect și încearcă să trimită un e-mail de test pentru a depista problemele de configurare.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleRunTest} disabled={isLoading} className="w-full bg-gradient-primary">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? 'Se rulează testul...' : 'Rulează testul de diagnosticare'}
                    </Button>
                    
                    {results && (
                        <div className="space-y-4 pt-4">
                            <StatusIndicator 
                                status={results.apiKeyFound} 
                                label="Cheie API Resend (RESEND_API_KEY)"
                                details={results.apiKeyFound ? "Găsită în .env.local." : "Negăsită sau valoare placeholder. Verifică fișierul .env.local."}
                            />
                             <StatusIndicator 
                                status={results.fromEmailFound} 
                                label="E-mail Expeditor (FEEDBACK_EMAIL_FROM)"
                                details={results.fromEmailFound ? "Găsit în .env.local." : "Negăsit. Verifică fișierul .env.local. Trebuie să fie un domeniu verificat în Resend (ex: 'noreply@domeniul-tau.com')."}
                            />
                             <StatusIndicator 
                                status={results.toEmailFound} 
                                label="E-mail Destinatar (FEEDBACK_EMAIL_TO)"
                                details={results.toEmailFound ? "Găsit în .env.local." : "Negăsit. Verifică fișierul .env.local."}
                            />
                            <StatusIndicator 
                                status={results.sendSuccess} 
                                label="Trimitere E-mail de Test"
                                details={
                                    results.sendSuccess 
                                    ? "E-mailul de test a fost trimis cu succes!" 
                                    : results.errorMessage 
                                      ? `Trimiterea a eșuat. ${results.errorMessage}`
                                      : "Nu s-a putut încerca trimiterea din cauza variabilelor lipsă."
                                }
                            />
                            {results.resendError && (
                                 <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                                    <h4 className="font-bold flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Eroare de la Resend</h4>
                                    <p className="font-mono text-sm mt-2 p-2 bg-black/20 rounded-md">{results.resendError}</p>
                                    <p className="text-xs mt-2">Această eroare vine direct de la API-ul Resend. Cauze comune: domeniu neverificat, cheie API incorectă sau e-mail destinatar invalid.</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
