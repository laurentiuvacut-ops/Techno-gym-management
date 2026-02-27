'use client';

import { Inter, Bebas_Neue } from 'next/font/google';
import '@/app/globals.css';
import { Button } from '@/components/ui/button';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const bebas_neue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas-neue' });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ro" className={`dark ${inter.variable} ${bebas_neue.variable}`}>
      <body className="antialiased bg-background text-foreground">
        <div className="flex flex-col items-center justify-center h-screen p-6 text-center space-y-6">
          <h1 className="text-5xl font-headline text-primary tracking-tighter">TECHNO GYM</h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Eroare Critică</h2>
            <p className="text-muted-foreground max-w-md italic">Aplicația a întâmpinat o problemă neprevăzută.</p>
          </div>
          <Button 
            onClick={() => reset()} 
            className="bg-primary text-primary-foreground font-bold h-12 px-8 rounded-xl"
          >
            Resetează Aplicația
          </Button>
        </div>
      </body>
    </html>
  );
}
