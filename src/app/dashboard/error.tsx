'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-headline tracking-wider uppercase text-white">Ceva nu a mers bine</h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm italic">
          {error.message.includes('permission') 
            ? "Nu ai permisiunea de a accesa aceste date. Te rugăm să verifici dacă ești logat corect." 
            : "A apărut o eroare la încărcarea datelor. Te rugăm să reîncerci."}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button onClick={() => reset()} className="w-full gap-2 rounded-xl h-12 font-bold uppercase tracking-wider">
          <RefreshCcw className="w-4 h-4" /> Reîncearcă
        </Button>
        <Button variant="outline" asChild className="w-full gap-2 rounded-xl h-12 font-bold uppercase tracking-wider border-white/10">
          <Link href="/"><Home className="w-4 h-4" /> Acasă</Link>
        </Button>
      </div>
    </div>
  );
}
