import type { Metadata, Viewport } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import ServiceWorkerRegister from '@/components/service-worker-register';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const bebas_neue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-bebas-neue',
});

export const metadata: Metadata = {
  title: 'Techno Gym',
  description: 'Your futuristic gym companion.',
  referrer: 'no-referrer-when-downgrade',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Techno Gym',
  },
  icons: {
    apple: 'https://i.imgur.com/9W1ye1w.png',
  }
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`dark ${inter.variable} ${bebas_neue.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
