'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ArrowRight, Clock, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { addDays, format } from 'date-fns';

function OnboardingForm({ user, firestore }: { user: any, firestore: any }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!user.phoneNumber) return;

    setIsSubmitting(true);
    const memberDocRef = doc(firestore, 'members', user.uid);
    try {
      await setDoc(memberDocRef, {
        id: user.uid,
        name: name,
        email: null,
        phone: user.phoneNumber,
        photoURL: null,
        qrCode: user.phoneNumber,
        status: 'Expired',
        daysRemaining: 0,
        subscriptionId: null,
      });
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // This form can be styled later if needed
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <form onSubmit={handleCreateProfile} className="space-y-4 p-4 glass rounded-3xl">
        <h2 className='text-2xl font-headline text-center'>Finalizează Profilul</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nume și Prenume"
          className="w-full p-2 rounded-md bg-input text-foreground"
          required
        />
        <button type="submit" className="w-full p-2 rounded-md bg-gradient-primary text-primary-foreground" disabled={isSubmitting}>
          {isSubmitting ? 'Se salvează...' : 'Salvează Profilul'}
        </button>
      </form>
    </div>
  );
}


export default function DashboardHomePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'done'>('idle');

  const memberDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'members', user.uid);
  }, [firestore, user]);

  const { data: memberData, isLoading: memberLoading } = useDoc(memberDocRef);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    const attemptMigration = async () => {
      if (user && firestore && !memberData && !memberLoading && migrationStatus === 'idle') {
        setMigrationStatus('migrating');
        const userPhoneNumber = user.phoneNumber;
        if (!userPhoneNumber) {
          setMigrationStatus('done');
          return;
        }

        const phoneVariants = [userPhoneNumber, userPhoneNumber.substring(3), `0${userPhoneNumber.substring(3)}`];
        const q = query(collection(firestore, 'members'), where("phone", "in", phoneVariants));
        const querySnapshot = await getDocs(q);

        let legacyDoc = querySnapshot.docs.find(d => d.id !== user.uid);

        if (legacyDoc) {
          await setDoc(doc(firestore, 'members', user.uid), {
            ...legacyDoc.data(),
            id: user.uid,
            phone: userPhoneNumber,
            qrCode: userPhoneNumber,
          });
        }
        setMigrationStatus('done');
      }
    };
    attemptMigration();
  }, [user, firestore, memberData, memberLoading, migrationStatus]);


  const loading = userLoading || memberLoading || migrationStatus !== 'done';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!memberData) {
    return <OnboardingForm user={user} firestore={firestore} />;
  }

  const expirationDate = format(addDays(new Date(), memberData.daysRemaining), 'dd MMM yyyy');
  const displayName = memberData?.name?.split(' ')[0] || 'Membru';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-4xl font-headline tracking-wider">Bine ai venit, {displayName}!</h1>
        <p className="text-muted-foreground">Iată un sumar al contului tău.</p>
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
              <h2 className="font-bold">Status Abonament</h2>
              <p className="text-sm text-primary">{memberData.status}</p>
            </div>
          </div>
          <div className="text-center my-8">
            <p className="text-8xl md:text-9xl font-headline text-gradient leading-none">{memberData.daysRemaining}</p>
            <p className="font-bold tracking-widest">Zile Rămase</p>
            <p className="text-sm text-muted-foreground">Expiră pe {expirationDate}</p>
          </div>
          <div/>
        </div>

        {/* QR Code */}
        <div className="p-8 glass rounded-3xl flex flex-col items-center justify-center text-center gap-4">
          <div className="border-2 border-dashed border-border p-4 rounded-xl">
             <QrCode className="w-24 h-24 text-muted-foreground" />
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
  );
}
