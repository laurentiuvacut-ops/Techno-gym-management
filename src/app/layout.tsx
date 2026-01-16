import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Header />
        <main className="min-h-screen pt-20 pb-24 px-4">
          {children}
        </main>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
