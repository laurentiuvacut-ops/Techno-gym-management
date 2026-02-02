import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import { FirebaseClientProvider } from '@/firebase';
import MainContainer from '@/components/layout/main-container';

export const metadata: Metadata = {
  title: 'Techno Gym',
  description: 'Your futuristic gym companion.',
  manifest: '/manifest.json',
  icons: {
    apple: 'https://i.imgur.com/gd54yJq.png',
  },
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
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
