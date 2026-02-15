'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { debugStripeConfig, type DebugStripeOutput } from '@/ai/flows/debug-stripe';
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DebugStripePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<DebugStripeOutput | null>(null);

    const handleRunTest = async () => {
        setIsLoading(true);
        setResults(null);
        const res = await debugStripeConfig();
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
                    <CardTitle>Diagnosticare Configurare Plăți (Stripe)</CardTitle>
                    <CardDescription>
                        Acest test verifică dacă cheia secretă Stripe este setată corect în variabilele de mediu.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleRunTest} disabled={isLoading} className="w-full bg-gradient-primary">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? 'Se rulează testul...' : 'Rulează testul de diagnosticare'}
                    </Button>
                    
                    {results && (
                        <div className="space-y-4 pt-4">
                             <div className="flex items-start gap-4 p-4 rounded-lg bg-foreground/5">
                                {results.secretKeyFound ? <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-success" /> : <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-destructive" />}
                                <div>
                                    <p className={`font-semibold ${results.secretKeyFound ? 'text-success' : 'text-destructive'}`}>Cheie Secretă Stripe (STRIPE_SECRET_KEY)</p>
                                    <p className="text-sm text-muted-foreground">{results.secretKeyFound ? "Cheia secretă a fost găsită în .env.local." : "Cheia secretă lipsește sau are valoarea placeholder. Verifică fișierul .env.local."}</p>
                                </div>
                            </div>
                            {results.errorMessage && (
                                <p className="text-sm text-destructive">{results.errorMessage}</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
