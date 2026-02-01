'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { Icons } from "@/components/icons";
import DaysRemainingChart from "@/components/days-remaining-chart";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function OnboardingForm({ user, firestore }: { user: any, firestore: any }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Te rugăm să completezi numele.");
      return;
    }
    if (!user.phoneNumber) {
        alert("Numărul de telefon nu a fost găsit. Te rugăm să te re-autentifici.");
        return;
    }

    setIsSubmitting(true);
    const memberDocRef = doc(firestore, 'members', user.uid);
    try {
      // Using setDoc will create or overwrite the document for the current user.
      await setDoc(memberDocRef, {
        id: user.uid,
        name: name,
        email: null, // Assuming email is not collected at this stage
        phone: user.phoneNumber,
        photoURL: null, // Assuming photo is not collected
        qrCode: user.phoneNumber, // For new users, QR code is their phone number
        status: 'Expired', // New users start with an expired status
        daysRemaining: 0,
        subscriptionId: null,
      });
      // The useDoc hook in the parent will automatically pick up the new data and re-render.
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("A apărut o eroare la crearea profilului. Te rugăm să încerci din nou.");
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Finalizează Profilul</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateProfile} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nume Complet</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nume și Prenume"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Se salvează...' : 'Salvează Profilul'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}


export default function DashboardPage() {
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
    // This effect handles migrating a legacy user profile to the new UID-based document structure.
    const attemptMigration = async () => {
      // Conditions to run: user is loaded, Firestore is available, no member data found for UID yet, and migration hasn't been attempted.
      if (user && firestore && !memberData && !memberLoading && migrationStatus === 'idle') {
        setMigrationStatus('migrating');
        
        const userPhoneNumber = user.phoneNumber;
        if (!userPhoneNumber) {
          console.log("User has no phone number, proceeding to onboarding.");
          setMigrationStatus('done');
          return;
        }

        // To handle different phone number formats in the database (e.g., +407..., 07..., 7...), we check for variations.
        const phoneVariants = [userPhoneNumber];
        if (userPhoneNumber.startsWith('+40')) {
            const nationalNumber = userPhoneNumber.substring(3);
            phoneVariants.push(nationalNumber); // "712345678"
            phoneVariants.push(`0${nationalNumber}`); // "0712345678"
        }

        try {
          const membersRef = collection(firestore, 'members');
          // Query for a legacy document.
          const q = query(membersRef, where("phone", "in", phoneVariants));
          const querySnapshot = await getDocs(q);

          let legacyDoc = null;
          for (const doc of querySnapshot.docs) {
              // Heuristic to find the un-migrated, legacy record: pick the first one not already matching the current user's UID.
              if (doc.id !== user.uid) { 
                  legacyDoc = doc;
                  break;
              }
          }

          if (legacyDoc) {
            console.log("Found legacy profile, migrating...");
            const legacyData = legacyDoc.data();
            const newDocRef = doc(firestore, 'members', user.uid);
            
            // Create a new document with the UID as the ID, copying the legacy data.
            // We can't delete the old document due to security rules, but this ensures the user sees their correct data.
            await setDoc(newDocRef, {
              ...legacyData,
              id: user.uid, // Critically, we now associate the profile with the auth UID.
              phone: userPhoneNumber, // Standardize the phone number format.
              // For migrated users, QR code should be their phone number to match the old system.
              qrCode: userPhoneNumber,
            });
            // The useDoc hook will now find the new document and update the UI.

          } else {
            console.log("No legacy profile found for this phone number.");
          }
        } catch (e) {
          console.error("Error during profile migration check:", e);
        } finally {
          // Whether migration succeeded or not, we mark it as done to prevent re-running.
          // If no doc was created, the UI will proceed to the onboarding form.
          setMigrationStatus('done');
        }
      }
    };

    attemptMigration();
  }, [user, firestore, memberData, memberLoading, migrationStatus]);


  const loading = userLoading || memberLoading || migrationStatus === 'migrating';

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If migration is done, and there's still no data, it means it's a genuinely new user.
  if (migrationStatus === 'done' && !memberData) {
      return <OnboardingForm user={user} firestore={firestore} />;
  }
  
  if (!memberData) {
      // This state is shown while loading or migrating.
      return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
  }

  // If we have memberData, show the dashboard.
  const daysLeft = memberData.daysRemaining;
  const totalDays = 30; // This might need to come from subscription data later

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-8">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">STATUS ABONAMENT</p>
                <p className="font-bold text-xl flex items-center gap-2">
                  {memberData.status === 'Active' ? 'Activ' : 'Expirat'} 
                  {memberData.status === 'Active' && <Check className="w-5 h-5 text-green-500" />}
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                    <Icons.qrCode className="w-8 h-8" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card/90 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Scanează la intrare</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-center p-8">
                      {memberData.qrCode ? (
                          <Image
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(memberData.qrCode)}`}
                              width={200}
                              height={200}
                              alt="Member QR Code"
                          />
                      ) : (
                          <p>QR Code indisponibil</p>
                      )}
                  </div>
                  <p className="text-center text-muted-foreground text-sm">
                      Prezintă acest cod la recepție pentru a intra în sală.
                  </p>
                </DialogContent>
              </Dialog>
          </div>
          
          <div className="flex flex-col items-center text-center gap-2">
            <DaysRemainingChart daysLeft={daysLeft} totalDays={totalDays} />
            <p className="text-2xl font-bold mt-4">Abonamentul expiră în</p>
            <p className="text-lg text-muted-foreground">{Math.ceil(daysLeft / 7)} săptămâni</p>
          </div>

        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <Link href="/subscriptions" className="flex items-center justify-between">
            <div>
              <p className="font-bold">Reînnoiește abonamentul</p>
              <p className="text-sm text-muted-foreground">
                Nu lăsa să expire. Alege un plan nou astăzi!
              </p>
            </div>
            <div className="bg-white/10 p-2 rounded-full">
                <ChevronRight className="text-white" />
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
