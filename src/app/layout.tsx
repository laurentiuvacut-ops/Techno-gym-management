import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import { FirebaseClientProvider } from '@/firebase';
import MainContainer from '@/components/layout/main-container';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Techno Gym',
  description: 'Your futuristic gym companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script src="https://www.google.com/recaptcha/enterprise.js?render=6LcqwlosAAAAAPx4W8ob5pleV4w6qbHERxyhcWYC" strategy="beforeInteractive" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <Header />
          <MainContainer>
            {children}
          </MainContainer>
          <BottomNav />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
