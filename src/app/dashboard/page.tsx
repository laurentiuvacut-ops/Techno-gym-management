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
import { cn } from '@/lib/utils';

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
    status: "Inactiv",
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
        status: "Inactiv",
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
            status: diff >= 0 ? "Activ" : "Inactiv",
            expirationDateDisplay: format(expDate, 'dd MMM yyyy'),
            daysForDisplay: Math.max(0, diff),
            isSet: true
        });
    } else {
      setSubscriptionInfo({
        daysRemaining: 0,
        status: "Inactiv",
        expirationDateDisplay: "N/A",
        daysForDisplay: 0,
        isSet: true
      });
    }
  }, [memberData]);

  const handleInstallClick = () => {
    setShowInstallInstructions(true);
  };
  
  if (isUserLoading || !mounted) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
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
  
  const displayName = memberData?.name?.split(' ')[0] || 'Membru';
  // Use the plan type stored in the database, or a fallback
  const subscriptionTitle = memberData?.subscriptionType || 'Fără Abonament';
  const isActive = subscriptionInfo.status === "Activ";

  return (
    <>
    <PwaInstallInstructions open={showInstallInstructions} onOpenChange={setShowInstallInstructions} />
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8 pb-10"
    >
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-headline tracking-wider">Salut, {displayName}!</h1>
          <p className="text-muted-foreground text-lg">Iată un sumar al contului tău.</p>
        </div>
        <Button 
          onClick={handleInstallClick}
          className="bg-gradient-primary text-primary-foreground shadow-lg px-6 py-5 h-auto text-sm md:text-base font-bold"
        >
          <Download className="mr-2 h-5 w-5" />
          Instalează App
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Hero Card */}
        <div className="relative lg:col-span-2 p-6 md:p-10 overflow-hidden glass rounded-3xl flex flex-col justify-between min-h-[350px] md:min-h-[400px]">
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px] -z-10" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-headline tracking-wide uppercase">{subscriptionTitle}</h2>
              <p className={cn(
                "text-sm font-bold uppercase tracking-[0.2em]",
                isActive ? "text-primary" : "text-destructive"
              )}>
                {subscriptionInfo.status}
              </p>
            </div>
          </div>
          
          <div className="text-center my-6">
            {!subscriptionInfo.isSet || memberLoading ? (
              <Skeleton className="h-24 w-40 mx-auto rounded-2xl" />
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-[120px] md:text-[180px] font-headline text-gradient leading-[0.7] select-none tracking-tighter">
                  {subscriptionInfo.daysForDisplay}
                </p>
                <div className="mt-8">
                  <p className="font-bold tracking-[0.3em] text-xs md:text-sm uppercase">Zile Rămase</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1" suppressHydrationWarning>Expiră la {subscriptionInfo.expirationDateDisplay}</p>
                </div>
              </div>
            )}
          </div>
          <div/>
        </div>

        {/* Access Code Card */}
        <div className="p-8 glass rounded-3xl flex flex-col items-center justify-center text-center gap-6 min-h-[350px] md:min-h-[400px]">
          {isActive && user.phoneNumber ? (
            <>
              <div className="p-4 bg-white rounded-[2rem] shadow-2xl transition-transform hover:scale-105 duration-300">
                  <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${user.phoneNumber}&bgcolor=255-255-255`}
                      alt="QR Code pentru acces"
                      width={180}
                      height={180}
                      className="rounded-xl"
                      priority
                  />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-headline tracking-wide">Cod de Acces</h3>
                <p className="text-sm text-muted-foreground">Scanează la recepție pentru intrare.</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-40 h-40 bg-muted/20 rounded-3xl flex items-center justify-center p-8 text-center border-2 border-dashed border-border/50">
                  <p className="text-sm text-muted-foreground text-center">Codul QR este indisponibil.</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-headline tracking-wide text-destructive">Abonament Inactiv</h3>
                <p className="text-sm text-muted-foreground">Reînnoiește-ți planul pentru acces.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/shop">
          <div className="group p-8 glass rounded-3xl transition-all duration-300 hover:border-primary/40 active:scale-[0.98] h-full flex flex-col justify-between min-h-[160px]">
            <div className="space-y-2">
              <h3 className="text-3xl font-headline tracking-wide">Shop & Stoc</h3>
              <p className="text-muted-foreground">Verifică stocul de produse.</p>
            </div>
            <div className="flex justify-end mt-4">
              <div className="w-12 h-12 rounded-full glass flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/plans">
          <div className="group p-8 glass rounded-3xl transition-all duration-300 hover:border-primary/40 active:scale-[0.98] h-full flex flex-col justify-between min-h-[160px]">
            <div className="space-y-2">
              <h3 className="text-3xl font-headline tracking-wide">Abonamente</h3>
              <p className="text-muted-foreground">Vezi toate planurile disponibile.</p>
            </div>
            <div className="flex justify-end mt-4">
              <div className="w-12 h-12 rounded-full glass flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
    </>
  );
}
