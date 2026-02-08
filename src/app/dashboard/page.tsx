'use client';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { doc } from "firebase/firestore";
import { ArrowRight, Clock, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { format, differenceInCalendarDays, parse, isValid } from 'date-fns';
import { subscriptions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PwaInstallInstructions } from '@/components/pwa-install-instructions';

export default function DashboardHomePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  // The document ID is now the user's UID. This is the secure, standard way.
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
  
  const { daysRemaining, status, expirationDateDisplay } = useMemo(() => {
    if (memberData?.expirationDate && typeof memberData.expirationDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(memberData.expirationDate)) {
        
        const expDate = parse(memberData.expirationDate, 'yyyy-MM-dd', new Date());

        if (isValid(expDate)) {
            const today = new Date();
            const diff = differenceInCalendarDays(expDate, today);

            return {
                daysRemaining: diff,
                status: diff >= 0 ? "Activ" : "Expirat",
                expirationDateDisplay: format(expDate, 'dd MMM yyyy')
            };
        }
    }

    // Default values
    return {
        daysRemaining: 0,
        status: "Expirat",
        expirationDateDisplay: "N/A"
    };
  }, [memberData]);


  const loading = userLoading || memberLoading;

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // This now correctly waits for the loading to finish before deciding
  // whether to show the registration prompt.
  if (!memberLoading && !memberData) {
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
  
  const currentSubscription = subscriptions.find(sub => sub.title === memberData?.subscriptionType);
  
  const daysForDisplay = Math.max(0, daysRemaining);
  
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
          {daysRemaining >= 0 && memberData.qrCode ? (
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
