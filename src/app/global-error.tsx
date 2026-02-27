'use client';

import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ro" className="dark">
      <body className="antialiased bg-background text-foreground font-sans">
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary tracking-tighter">TECHNO GYM</h1>
            <h2 className="text-2xl font-bold text-white">Eroare de Sistem</h2>
            <p className="text-muted-foreground max-w-md italic mx-auto">
              Aplicația a întâmpinat o problemă critică. Am fost notificați și lucrăm la remediere.
            </p>
          </div>
          <button 
            onClick={() => reset()} 
            className="bg-primary text-primary-foreground font-bold h-12 px-8 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
          >
            Reîncearcă Încărcarea
          </button>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left overflow-auto max-w-full">
              <p className="text-red-500 font-mono text-xs">{error.message}</p>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}