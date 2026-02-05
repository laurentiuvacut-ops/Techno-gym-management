'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bug, Key, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { subscriptions } from '@/lib/data';
import { getStripeConfigStatus } from '@/ai/flows/debug-stripe-config';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DebugStripePage() {
  const [isSecretKeySet, setIsSecretKeySet] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      setLoading(true);
      try {
        const status = await getStripeConfigStatus();
        setIsSecretKeySet(status.isSecretKeySet);
      } catch (e) {
        console.error("Failed to get Stripe config status", e);
        setIsSecretKeySet(false);
      } finally {
        setLoading(false);
      }
    };
    checkConfig();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <Button asChild variant="outline" className="w-fit">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Înapoi la Panou
        </Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-4xl font-headline tracking-wider flex items-center gap-3">
          <Bug className="w-8 h-8" />
          Debug Configurare Stripe
        </h1>
        <p className="text-muted-foreground">Verificați dacă datele din Stripe sunt configurate corect.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" />Cheie Secretă Stripe</CardTitle>
          <CardDescription>Verifică dacă cheia secretă din fișierul `.env.local` este încărcată corect de către server.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded-full animate-pulse" />
              <p>Se verifică...</p>
            </div>
          ) : isSecretKeySet ? (
            <Alert variant="default" className="border-primary/50 bg-primary/10">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Cheia Secretă este Setată Corect</AlertTitle>
              <AlertDescription>
                Serverul a încărcat cu succes cheia `STRIPE_SECRET_KEY`. Conexiunea cu Stripe ar trebui să fie posibilă.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Cheia Secretă NU este Setată!</AlertTitle>
              <AlertDescription>
                Serverul nu a putut găsi `STRIPE_SECRET_KEY`. Verificați următoarele:
                <ul className="list-decimal list-inside mt-2">
                  <li>Ați creat fișierul `.env.local` în directorul principal?</li>
                  <li>Ați scris corect `STRIPE_SECRET_KEY=sk_test_...`?</li>
                  <li>Ați **repornit serverul** de dezvoltare după ce ați creat/modificat fișierul `.env.local`? Aceasta este o etapă obligatorie.</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ID-uri Preț Abonamente</CardTitle>
          <CardDescription>Acestea sunt ID-urile de preț (`stripePriceId`) pe care aplicația le citește din `src/lib/data.ts` și le trimite la Stripe. Asigurați-vă că se potrivesc **exact** (caracter cu caracter) cu cele din modul de **Test** din contul Stripe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-foreground/5">
              <div>
                <p className="font-semibold">{sub.title}</p>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md inline-block mt-1">{sub.stripePriceId}</p>
              </div>
              <div>
                {sub.stripePriceId.includes('placeholder') ? (
                   <Badge variant="destructive">Temporar</Badge>
                ) : sub.stripePriceId.startsWith('price_') ? (
                   <Badge variant="secondary" className="border-primary/50 bg-primary/10 text-primary">Format Corect</Badge>
                ) : (
                   <Badge variant="destructive">Format Incorect</Badge>
                )}
              </div>
            </div>
          ))}
           <Alert className="mt-4">
              <AlertTitle>Puncte de verificare</AlertTitle>
              <AlertDescription>
                <ul className="list-decimal list-inside">
                    <li>ID-urile de mai sus corespund cu cele din secțiunea **Products &rarr; [Nume Produs] &rarr; Pricing** din contul Stripe?</li>
                    <li>Sunteți în modul **Test** în contul Stripe când copiați ID-urile? ID-urile pentru Test și Live sunt diferite.</li>
                    <li>Nu există spații goale la începutul sau la sfârșitul ID-ului?</li>
                </ul>
              </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}
