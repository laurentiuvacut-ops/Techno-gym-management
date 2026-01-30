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
import { doc, setDoc } from "firebase/firestore";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function OnboardingForm({ user, firestore }: { user: any, firestore: any }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Te rugăm să introduci numele tău.");
      return;
    }
    setIsSubmitting(true);
    const memberDocRef = doc(firestore, 'members', user.uid);
    try {
      await setDoc(memberDocRef, {
        id: user.uid,
        name: name,
        email: user.email, // Can be null with phone auth
        phone: user.phoneNumber,
        photoURL: user.photoURL,
        qrCode: user.phoneNumber,
        status: 'Expired',
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

  const loading = userLoading || memberLoading;

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If user is logged in but has no member document, show onboarding
  if (!memberData) {
      return <OnboardingForm user={user} firestore={firestore} />;
  }

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

    