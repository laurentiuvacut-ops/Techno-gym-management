'use client';

import { useState } from 'react';
import { debugResendConfig, type DebugStatus } from '@/ai/flows/debug-resend-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Send, Loader2 } from 'lucide-react';
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


export default function DebugResendPage() {
  const [result, setResult] = useState<DebugStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);
    const response = await debugResendConfig();
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
        <h1 className="text-4xl font-headline tracking-wider">Debug E-mail (Resend)</h1>
        <p className="text-muted-foreground">Verifică dacă setările pentru trimiterea e-mailurilor sunt corecte.</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cum funcționează?</AlertTitle>
        <AlertDescription>
          Acest instrument verifică dacă variabilele de mediu din fișierul `.env.local` sunt setate corect și încearcă să trimită un e-mail de test către adresa specificată în `FEEDBACK_EMAIL_TO`.
        </AlertDescription>
      </Alert>

      <Button onClick={handleTest} disabled={isLoading} className="w-full bg-gradient-primary text-primary-foreground py-6">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {isLoading ? 'Se trimite...' : 'Trimite E-mail de Test'}
      </Button>

      {result && (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Card className="glass">
                <CardHeader>
                    <CardTitle>Rezultate Debug</CardTitle>
                    <CardDescription>Mai jos este statusul încercării de a trimite e-mailul.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <section>
                        <h3 className="text-lg font-semibold mb-2">Verificare Configurație</h3>
                        <div className="space-y-2">
                            <StatusPill label="RESEND_API_KEY" value={result.env.apiKeyFound} />
                            <StatusPill label="FEEDBACK_EMAIL_TO" value={result.env.toAddressFound} />
                            <StatusPill label="FEEDBACK_EMAIL_FROM" value={result.env.fromAddressFound} />
                        </div>
                    </section>
                    
                    <section>
                        <h3 className="text-lg font-semibold mb-2">Status Trimitere</h3>
                         <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-md">
                           <span className="text-muted-foreground">Destinatar (To)</span>
                           <span className="font-mono text-xs">{result.to || 'N/A'}</span>
                        </div>
                         <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-md mt-2">
                           <span className="text-muted-foreground">Expeditor (From)</span>
                           <span className="font-mono text-xs">{result.from || 'N/A'}</span>
                        </div>
                    </section>

                    {result.status === 'Succes' && (
                        <Alert variant="default" className="border-success/50 bg-success/10 text-success-foreground">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <AlertTitle>Succes!</AlertTitle>
                            <AlertDescription>
                                E-mailul de test a fost trimis cu succes! Verifică inbox-ul adresei `{result.to}`.
                            </AlertDescription>
                        </Alert>
                    )}

                    {result.error && (
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
