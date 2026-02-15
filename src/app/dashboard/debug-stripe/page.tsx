'use client';

import { useState } from 'react';
import { debugStripeConfig, type StripeDebugStatus } from '@/ai/flows/debug-stripe-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Wallet, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function StatusPill({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-md">
      <span className="text-muted-foreground">{label}</span>
      {value ? (
        <Badge variant="success" className="gap-1.5">
          <CheckCircle className="h-3.5 w-3.5" /> Găsit
        </Badge>
      ) : (
        <Badge variant="destructive" className="gap-1.5">
          <XCircle className="h-3.5 w-3.5" /> Lipsește
        </Badge>
      )}
    </div>
  );
}


export default function DebugStripePage() {
  const [result, setResult] = useState<StripeDebugStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);
    const response = await debugStripeConfig();
    setResult(response);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h1 className="text-4xl font-headline tracking-wider">Debug Plăți (Stripe)</h1>
        <p className="text-muted-foreground">Verifică dacă setările pentru procesarea plăților sunt corecte.</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cum funcționează?</AlertTitle>
        <AlertDescription>
          Acest instrument verifică dacă variabila de mediu `STRIPE_SECRET_KEY` din fișierul `.env.local` este setată corect. Această cheie este esențială pentru a crea sesiuni de plată.
        </AlertDescription>
      </Alert>

      <Button onClick={handleTest} disabled={isLoading} className="w-full bg-gradient-primary text-primary-foreground py-6">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
        {isLoading ? 'Se verifică...' : 'Verifică Configurația Stripe'}
      </Button>

      {result && (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Card className="glass">
                <CardHeader>
                    <CardTitle>Rezultate Debug</CardTitle>
                    <CardDescription>Mai jos este statusul verificării configurației Stripe.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <section>
                        <h3 className="text-lg font-semibold mb-2">Verificare Configurație</h3>
                        <div className="space-y-2">
                            <StatusPill label="STRIPE_SECRET_KEY" value={result.secretKeyFound} />
                        </div>
                    </section>

                    {result.status === 'Succes' && (
                        <Alert variant="default" className="border-success/50 bg-success/10 text-success-foreground">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <AlertTitle>Succes!</AlertTitle>
                            <AlertDescription>
                                {result.error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {result.error && result.status !== 'Succes' && (
                         <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>{result.status}</AlertTitle>
                            <AlertDescription className="font-mono text-xs whitespace-pre-wrap break-all">
                                {result.error}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </motion.div>
      )}

    </motion.div>
  );
}
