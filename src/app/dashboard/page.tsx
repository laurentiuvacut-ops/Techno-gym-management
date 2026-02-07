'use client';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { doc, setDoc, collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { ArrowRight, Clock, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { addDays, format, differenceInDays, isAfter } from 'date-fns';
import { subscriptions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PwaInstallInstructions } from '@/components/pwa-install-instructions';

export default function DashboardHomePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [migrationAttempted, setMigrationAttempted] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  const handleInstallClick = () => {
    setShowInstallInstructions(true);
  };

  const memberDocRef = useMemo(() => {
    if (!firestore || !user || !user.phoneNumber) return null;
    return doc(firestore, 'members', user.phoneNumber);
  }, [firestore, user]);

  const { data: memberData, isLoading: memberLoading } = useDoc(memberDocRef);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // This effect handles the one-time migration check for legacy accounts.
  useEffect(() => {
    const attemptMigration = async () => {
      // Run only once per session after user and firestore are available.
      if (user && firestore && user.phoneNumber && !migrationAttempted) {
        setMigrationAttempted(true); // Mark that we are attempting migration.

        const userPhoneNumber = user.phoneNumber;
        
        // Search for a legacy profile with the same phone number.
        const phoneVariants = [userPhoneNumber, userPhoneNumber.substring(3), `0${userPhoneNumber.substring(3)}`];
        const q = query(collection(firestore, 'members'), where("phone", "in", phoneVariants));
        const querySnapshot = await getDocs(q);
        
        const legacyDocSnap = querySnapshot.docs.find(d => d.id !== user.uid && d.id !== user.phoneNumber);

        if (legacyDocSnap) {
          // Legacy profile found. Now, check the user's current profile state.
          const currentUserDocRef = doc(firestore, 'members', userPhoneNumber);
          const currentUserDocSnap = await getDoc(currentUserDocRef);
          
          const currentExpiration = currentUserDocSnap.data()?.expirationDate;
          const isExpired = !currentUserDocSnap.exists() || !currentExpiration || !isAfter(new Date(currentExpiration), new Date());

          if (isExpired) {
             const legacyData = legacyDocSnap.data();
             const { daysRemaining, subscriptionId, status, ...restOfLegacyData } = legacyData;
             const daysFromLegacy = daysRemaining || 0;
             const sub = subscriptions.find(s => s.id === subscriptionId);

            await setDoc(currentUserDocRef, {
              ...restOfLegacyData,
              id: user.uid,
              phone: userPhoneNumber,
              qrCode: userPhoneNumber,
              expirationDate: format(addDays(new Date(), daysFromLegacy), 'yyyy-MM-dd'),
              subscriptionType: sub ? sub.title : null,
            });
          }
        }
      }
    };
    attemptMigration();
  }, [user, firestore, migrationAttempted]);


  const loading = userLoading || memberLoading || !migrationAttempted;

  useEffect(() => {
    if (!loading && user && !memberData) {
        router.push('/register');
    }
  }, [loading, user, memberData, router]);

  const currentSubscription = useMemo(() => {
    if (!memberData || !memberData.subscriptionType) return null;
    return subscriptions.find(sub => sub.title === memberData.subscriptionType);
  }, [memberData]);
  
  if (loading || !memberData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const expDate = memberData.expirationDate ? new Date(memberData.expirationDate) : new Date(0);
  const daysRemaining = isAfter(expDate, new Date()) ? differenceInDays(expDate, new Date()) : 0;
  const status = daysRemaining > 0 ? "Active" : "Expired";
  const expirationDateDisplay = format(expDate, 'dd MMM yyyy');
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
            <p className="text-8xl md:text-9xl font-headline text-gradient leading-none">{daysRemaining}</p>
            <p className="font-bold tracking-widest">Zile Rămase</p>
            <p className="text-sm text-muted-foreground">Expiră pe {expirationDateDisplay}</p>
          </div>
          <div/>
        </div>

        {/* QR Code */}
        <div className="p-8 glass rounded-3xl flex flex-col items-center justify-center text-center gap-4">
            <div className="p-2 bg-white rounded-xl">
                {memberData.qrCode ? (
                    <Image
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${memberData.qrCode}&bgcolor=255-255-255`}
                        alt="QR Code pentru acces"
                        width={128}
                        height={128}
                        className="rounded-md"
                    />
                ) : (
                    <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">QR indisponibil</p>
                    </div>
                )}
            </div>
          <h3 className="font-bold">Scanează pentru acces</h3>
          <p className="text-sm text-muted-foreground">Prezintă acest cod la recepție pentru a intra în sală.</p>
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
