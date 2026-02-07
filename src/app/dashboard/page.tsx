'use client';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { doc } from "firebase/firestore";
import { ArrowRight, Clock, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { subscriptions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PwaInstallInstructions } from '@/components/pwa-install-instructions';

export default function DashboardHomePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  const memberDocRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'members', user.uid);
  }, [firestore, user]);

  const { data: memberData, isLoading: memberLoading } = useDoc(memberDocRef);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const handleInstallClick = () => {
    setShowInstallInstructions(true);
  };

  const currentSubscription = useMemo(() => {
    if (!memberData || !memberData.subscriptionType) return null;
    return subscriptions.find(sub => sub.title === memberData.subscriptionType);
  }, [memberData]);

  const loading = userLoading || memberLoading;

  const calculateDaysLeft = (user: any) => {
    if (user && user.expirationDate) {
      const expDateString = user.expirationDate; // "YYYY-MM-DD"
      
      // Verificăm formatul string-ului pentru a evita erori
      if (typeof expDateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(expDateString)) {
        // Parsăm manual pentru a evita problemele de fus orar cu `new Date(string)`
        const [year, month, day] = expDateString.split('-').map(Number);
        
        // `new Date(year, month - 1, day)` creează data la miezul nopții în fusul orar local
        const expDate = new Date(year, month - 1, day);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Data de azi la miezul nopții

        // Verificăm dacă data este validă (ex: luna este 1-12)
        if (!isNaN(expDate.getTime())) {
            const diffTime = expDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return diffDays;
        }
      }
    }
    
    // Dacă nu există dată de expirare sau e invalidă, returnăm 0.
    return 0;
  };


  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!memberData) {
    return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center h-full text-center"
        >
            <h1 className="text-2xl font-headline mb-2">Finalizează-ți contul</h1>
            <p className="text-muted-foreground mb-6 max-w-sm">Profilul tău de membru nu a fost găsit. Te rugăm să completezi înregistrarea pentru a accesa panoul de control.</p>
            <Button asChild>
                <Link href="/register">Finalizează Înregistrarea</Link>
            </Button>
        </motion.div>
    );
  }

  const daysRemaining = calculateDaysLeft(memberData);
  const daysForDisplay = Math.max(0, daysRemaining);

  const status = daysRemaining > 0 ? "Activ" : "Expirat";
  const expDate = memberData.expirationDate ? new Date(memberData.expirationDate.replace(/-/g, '/')) : null;
  const expirationDateDisplay = expDate && !isNaN(expDate.getTime()) && memberData.subscriptionType ? format(expDate, 'dd MMM yyyy') : "N/A";
  const displayName = memberData?.name?.split(' ')[0] || 'Membru';
  const subscriptionTitle = currentSubscription?.title || 'Fără Abonament Activ';

  return (
    <>
    <PwaInstallInstructions open={showInstallInstructions} onOpenChange={setShowInstallInstructions} />
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-headline tracking-wider">Bine ai venit, {displayName}!</h1>
          <p className="text-muted-foreground">Iată un sumar al contului tău.</p>
        </div>
        <Button 
          onClick={handleInstallClick}
          className="bg-gradient-primary text-primary-foreground"
        >
          <Download className="mr-2 h-4 w-4" />
          Instalează Aplicația
        </Button>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hero Card */}
        <div className="relative lg:col-span-2 p-8 overflow-hidden glass rounded-3xl flex flex-col justify-between min-h-[300px]">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold">{subscriptionTitle}</h2>
              <p className="text-sm text-primary">{status}</p>
            </div>
          </div>
          <div className="text-center my-8">
            <p className="text-8xl md:text-9xl font-headline text-gradient leading-none">{daysForDisplay}</p>
            <p className="font-bold tracking-widest">Zile Rămase</p>
            <p className="text-sm text-muted-foreground">Expiră pe {expirationDateDisplay}</p>
          </div>
          <div/>
        </div>

        {/* QR Code */}
        <div className="p-8 glass rounded-3xl flex flex-col items-center justify-center text-center gap-4">
          {daysRemaining > 0 && memberData.qrCode ? (
            <>
              <div className="p-2 bg-white rounded-xl">
                  <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${memberData.qrCode}&bgcolor=255-255-255`}
                      alt="QR Code pentru acces"
                      width={128}
                      height={128}
                      className="rounded-md"
                  />
              </div>
              <h3 className="font-bold">Scanează pentru acces</h3>
              <p className="text-sm text-muted-foreground">Prezintă acest cod la recepție pentru a intra în sală.</p>
            </>
          ) : (
            <>
              <div className="w-36 h-36 bg-muted rounded-xl flex items-center justify-center p-4 text-center">
                  <p className="text-sm text-muted-foreground">Codul QR este afișat doar pentru abonamentele active.</p>
              </div>
              <h3 className="font-bold">Abonament Expirat</h3>
              <p className="text-sm text-muted-foreground">Reînnoiește-ți abonamentul pentru a genera codul de acces.</p>
            </>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/dashboard/shop">
          <div className="group p-6 glass rounded-3xl transition-colors duration-300 hover:border-primary/30">
            <h3 className="text-2xl font-headline">Shop & Stoc</h3>
            <p className="text-muted-foreground mb-4">Verifică stocul de produse.</p>
            <div className="flex justify-end">
              <ArrowRight className="text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
          </div>
        </Link>
        <Link href="/dashboard/plans">
          <div className="group p-6 glass rounded-3xl transition-colors duration-300 hover:border-primary/30">
            <h3 className="text-2xl font-headline">Abonamente</h3>
            <p className="text-muted-foreground mb-4">Vezi toate planurile disponibile.</p>
            <div className="flex justify-end">
              <ArrowRight className="text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
          </div>
        </Link>
      </div>

    </motion.div>
    </>
  );
}
