import type { Metadata, Viewport } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
const bebas_neue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-bebas-neue',
})

export const metadata: Metadata = {
  title: 'Techno Gym',
  description: 'Your futuristic gym companion.',
  manifest: '/manifest.json',
  icons: {
    apple: 'https://i.imgur.com/9W1ye1w.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${bebas_neue.variable}`}>
      <head/>
      <body className="antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
