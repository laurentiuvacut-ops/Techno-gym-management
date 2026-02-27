'use client';

import { useUser } from '@/firebase';
import { useMember } from '@/contexts/member-context';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import { useEffect, useState } from 'react';
import { ArrowRight, Clock, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { format, differenceInCalendarDays, isValid } from 'date-fns';
import { PwaInstallInstructions } from '@/components/pwa-install-instructions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { usePwaInstall } from '@/hooks/use-pwa-install';

export default function HomeTab() {
  const { user } = useUser();
  const { memberData, isLoading: memberLoading } = useMember();
  const { setActiveTab } = useDashboardNav();
  const { canPromptNative, isIOS, showButton, promptInstall } = usePwaInstall();

  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

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

  const handleInstallClick = async () => {
    if (canPromptNative) {
      await promptInstall();
    } else if (isIOS) {
      setShowInstallInstructions(true);
    }
  };

  if (!user) return null;
  
  const displayName = memberData?.name?.split(' ')[0] || 'Membru';
  const subscriptionTitle = memberData?.subscriptionType || 'Fără Abonament';
  const isActive = subscriptionInfo.status === "Activ";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(user.phoneNumber || '')}`;

  return (
    <>
    <PwaInstallInstructions open={showInstallInstructions} onOpenChange={setShowInstallInstructions} />
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 md:space-y-6 pb-6"
    >
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-3xl md:text-5xl font-headline tracking-wider">Salut, {displayName}!</h1>
      </div>

      {showButton && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full"
        >
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-white">Instalează Aplicația</p>
              <p className="text-xs text-muted-foreground">Acces rapid de pe ecranul principal</p>
            </div>
            <ArrowRight className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="relative lg:col-span-2 p-6 md:p-8 overflow-hidden glass rounded-3xl flex flex-col justify-between min-h-[240px] md:min-h-[280px]">
          <div className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 bg-primary/25 rounded-full blur-[120px] -z-10" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-headline tracking-wide uppercase leading-tight">{subscriptionTitle}</h2>
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em]",
                isActive ? "text-primary" : "text-destructive"
              )}>
                {subscriptionInfo.status}
              </p>
            </div>
          </div>
          
          <div className="text-center my-2 md:my-4">
            {!subscriptionInfo.isSet || memberLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-24 w-32 mx-auto rounded-2xl" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-8xl md:text-9xl font-headline text-gradient leading-none select-none tracking-tighter">
                  {subscriptionInfo.daysForDisplay}
                </p>
                <div className="mt-1 md:mt-2">
                  <p className="font-bold tracking-[0.3em] text-[10px] uppercase">Zile Rămase</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5" suppressHydrationWarning>Expiră: {subscriptionInfo.expirationDateDisplay}</p>
                </div>
              </div>
            )}
          </div>
          <div className="h-4" />
        </div>

        <div className="p-6 glass rounded-3xl flex flex-col items-center justify-center text-center gap-4 min-h-[240px] md:min-h-[280px]">
          {isActive ? (
            <>
              <div className="p-3 bg-white rounded-[1.5rem] shadow-xl transition-transform hover:scale-105 duration-300">
                  <Image
                      src={qrUrl}
                      alt="QR Code"
                      width={140}
                      height={140}
                      className="rounded-lg"
                      priority
                      unoptimized
                  />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xl font-headline tracking-wide uppercase">Cod de Acces</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Scanează la recepție</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-28 h-28 bg-muted/20 rounded-3xl flex items-center justify-center p-4 text-center border-2 border-dashed border-border/50">
                  <p className="text-[10px] text-muted-foreground">Indisponibil</p>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-headline tracking-wide text-destructive uppercase">Inactiv</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Reînnoiește-ți planul</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6">
        <button onClick={() => setActiveTab('shop')} className="text-left">
          <div className="group p-5 glass rounded-3xl transition-all duration-300 hover:border-primary/40 active:scale-[0.98] flex flex-col justify-between min-h-[140px] md:min-h-[160px]">
            <div className="space-y-0.5">
              <h3 className="text-xl font-headline tracking-wide uppercase leading-tight">Shop & Stoc</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Vezi stocul</p>
            </div>
            <div className="flex justify-end">
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </button>
        <button onClick={() => setActiveTab('workouts')} className="text-left">
          <div className="group p-5 glass rounded-3xl transition-all duration-300 hover:border-primary/40 active:scale-[0.98] flex flex-col justify-between min-h-[140px] md:min-h-[160px]">
            <div className="space-y-0.5">
              <h3 className="text-xl font-headline tracking-wide uppercase leading-tight">Jurnal Antrenament</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Vezi progresul</p>
            </div>
            <div className="flex justify-end">
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
    </>
  );
}
