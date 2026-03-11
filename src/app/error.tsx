'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-headline tracking-wider uppercase text-white">Eroare de Sistem</h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm italic">
          A apărut o problemă neașteptată. Te rugăm să reîncerci sau să te întorci la pagina principală.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mx-auto">
        <Button onClick={() => reset()} className="w-full gap-2 rounded-xl h-12 font-bold uppercase tracking-wider bg-primary text-primary-foreground">
          <RefreshCcw className="w-4 h-4" /> Reîncearcă
        </Button>
        <Button variant="outline" asChild className="w-full gap-2 rounded-xl h-12 font-bold uppercase tracking-wider border-white/10">
          <Link href="/"><Home className="w-4 h-4" /> Acasă</Link>
        </Button>
      </div>
    </div>
  );
}
