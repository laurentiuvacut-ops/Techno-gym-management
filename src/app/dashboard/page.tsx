'use client';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { doc } from "firebase/firestore";
import { ArrowRight, Clock, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { format, differenceInCalendarDays, isValid } from 'date-fns';
import { subscriptions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PwaInstallInstructions } from '@/components/pwa-install-instructions';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardHomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user && mounted) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, mounted]);

  const memberDocRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return doc(firestore, 'members', user.phoneNumber);
  }, [firestore, user]);
  
  const { data: memberData, isLoading: memberLoading } = useDoc(memberDocRef);

  const [subscriptionInfo, setSubscriptionInfo] = useState({
    daysRemaining: 0,
    status: "Expirat",
    expirationDateDisplay: "N/A",
    daysForDisplay: 0,
    isSet: false
  });

  useEffect(() => {
    if (!memberData) return;

    let expDate;
    const expirationValue = memberData.expirationDate;

    if (!expirationValue) {
      setSubscriptionInfo({
        daysRemaining: 0,
        status: "Expirat",
        expirationDateDisplay: "N/A",
        daysForDisplay: 0,
        isSet: true
      });
      return;
    }

    if (typeof expirationValue === 'object' && expirationValue !== null && typeof (expirationValue as any).toDate === 'function') {
        expDate = (expirationValue as any).toDate();
    }
    else if (typeof expirationValue === 'string') {
        const parts = expirationValue.split('-').map(part => parseInt(part, 10));
        if (parts.length === 3 && !parts.some(isNaN)) {
            expDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
        }
    }

    if (expDate && isValid(expDate)) {
        const today = new Date();
        const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        
        const diff = differenceInCalendarDays(expDate, todayUtc);

        setSubscriptionInfo({
            daysRemaining: diff,
            status: diff >= 0 ? "Activ" : "Expirat",
            expirationDateDisplay: format(expDate, 'dd MMM yyyy'),
            daysForDisplay: Math.max(0, diff),
            isSet: true
        });
    } else {
      setSubscriptionInfo({
        daysRemaining: 0,
        status: "Expirat",
        expirationDateDisplay: "N/A",
        daysForDisplay: 0,
        isSet: true
      });
    }
  }, [memberData]);


  const handleInstallClick = () => {
    setShowInstallInstructions(true);
  };
  
  const loading = isUserLoading || !mounted;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;
  
  if (!memberLoading && !memberData) {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
            <h1 className="text-2xl font-headline mb-2">Finalizează-ți contul</h1>
            <p className="text-muted-foreground mb-6 max-w-sm">Profilul tău de membru nu a fost găsit. Te rugăm să completezi înregistrarea pentru a accesa panoul de control.</p>
            <Button asChild size="lg">
                <Link href="/register">Finalizează Înregistrarea</Link>
            </Button>
        </div>
    );
  }
  
  const currentSubscription = subscriptions.find(sub => sub.title === memberData?.subscriptionType);
  const displayName = memberData?.name?.split(' ')[0] || 'Membru';
  const subscriptionTitle = currentSubscription?.title || 'Fără Abonament Activ';

  return (
    <>
    <PwaInstallInstructions open={showInstallInstructions} onOpenChange={setShowInstallInstructions} />
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline tracking-wider">Bine ai venit, {displayName}!</h1>
          <p className="text-muted-foreground">Iată un sumar al contului tău.</p>
        </div>
        <Button 
          onClick={handleInstallClick}
          className="bg-gradient-primary text-primary-foreground shadow-lg"
        >
          <Download className="mr-2 h-4 w-4" />
          Instalează App
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative lg:col-span-2 p-6 md:p-8 overflow-hidden glass rounded-3xl flex flex-col justify-between min-h-[280px]">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold">{subscriptionTitle}</h2>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">{subscriptionInfo.status}</p>
            </div>
          </div>
          
          <div className="text-center my-6">
            {!subscriptionInfo.isSet || memberLoading ? (
              <Skeleton className="h-24 w-32 mx-auto rounded-xl" />
            ) : (
              <>
                <p className="text-7xl md:text-9xl font-headline text-gradient leading-none">{subscriptionInfo.daysForDisplay}</p>
                <p className="font-bold tracking-widest text-sm md:text-base">Zile Rămase</p>
                <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>Expiră pe {subscriptionInfo.expirationDateDisplay}</p>
              </>
            )}
          </div>
          <div/>
        </div>

        <div className="p-8 glass rounded-3xl flex flex-col items-center justify-center text-center gap-4 min-h-[280px]">
          {subscriptionInfo.daysRemaining >= 0 && user.phoneNumber ? (
            <>
              <div className="p-3 bg-white rounded-2xl shadow-inner">
                  <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${user.phoneNumber}&bgcolor=255-255-255`}
                      alt="QR Code pentru acces"
                      width={160}
                      height={160}
                      className="rounded-lg"
                      priority
                  />
              </div>
              <div>
                <h3 className="font-bold">Cod de Acces</h3>
                <p className="text-xs text-muted-foreground mt-1">Scanează la recepție pentru intrare.</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-40 h-40 bg-muted/30 rounded-2xl flex items-center justify-center p-6 text-center border border-dashed border-border">
                  <p className="text-xs text-muted-foreground">Codul QR este indisponibil.</p>
              </div>
              <div>
                <h3 className="font-bold">Abonament Expirat</h3>
                <p className="text-xs text-muted-foreground mt-1">Reînnoiește-ți planul pentru acces.</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Link href="/dashboard/shop">
          <div className="group p-6 glass rounded-3xl transition-all duration-300 hover:border-primary/40 active:scale-[0.98]">
            <h3 className="text-2xl font-headline">Shop & Stoc</h3>
            <p className="text-sm text-muted-foreground mb-4">Verifică stocul de produse.</p>
            <div className="flex justify-end">
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/plans">
          <div className="group p-6 glass rounded-3xl transition-all duration-300 hover:border-primary/40 active:scale-[0.98]">
            <h3 className="text-2xl font-headline">Abonamente</h3>
            <p className="text-sm text-muted-foreground mb-4">Vezi toate planurile disponibile.</p>
            <div className="flex justify-end">
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
    </>
  );
}