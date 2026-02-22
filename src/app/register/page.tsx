'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function RegisterPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login');
        }
    }, [user, isUserLoading, router]);

    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !agreed || !user || !firestore || !user.phoneNumber) {
            toast({
                variant: "destructive",
                title: "Informații Lipsă",
                description: "Vă rugăm să completați numele și să fiți de acord cu regulamentul.",
            });
            return;
        };

        setIsSubmitting(true);
        
        const memberDocRef = doc(firestore, 'members', user.phoneNumber);

        try {
            // Verifică dacă documentul există deja (pentru a nu suprascrie datele clienților existenți)
            const existingDoc = await getDoc(memberDocRef);

            const dataToSet: Record<string, any> = {
                id: user.uid,
                name: name,
                email: user.email || null,
                phone: user.phoneNumber,
                photoURL: user.photoURL || null,
                qrCode: user.phoneNumber,
                agreedToTermsAt: new Date().toISOString(),
            };

            // Setează valori default doar dacă membrul nu există deja în bază (adăugat manual de admin/soft)
            if (!existingDoc.exists()) {
                dataToSet.expirationDate = format(new Date(0), 'yyyy-MM-dd');
                dataToSet.subscriptionType = null;
                dataToSet.status = "Inactive";
            }

            await setDoc(memberDocRef, dataToSet, { merge: true });
            
            router.push('/dashboard');
        } catch (error) {
            console.error("Error creating profile:", error);
            toast({
                variant: "destructive",
                title: "Eroare la crearea profilului",
                description: "A apărut o problemă. Vă rugăm să încercați din nou.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isUserLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <form onSubmit={handleCreateProfile} className="space-y-6 p-8 glass rounded-3xl">
                    <div className="space-y-2 text-center">
                        <h1 className='text-3xl font-headline'>Finalizează Înregistrarea</h1>
                        <p className="text-muted-foreground text-sm">Aproape gata! Completează-ți profilul pentru a avea acces la facilități.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nume și Prenume</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ex: Popescu Ion"
                                required
                                className="bg-foreground/5 h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Număr de Telefon</Label>
                            <Input
                                id="phone"
                                value={user.phoneNumber || ''}
                                disabled
                                readOnly
                                className="bg-foreground/5 h-12 opacity-70"
                            />
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 pt-2">
                        <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="terms"
                                className="text-xs font-medium leading-normal cursor-pointer text-muted-foreground"
                            >
                                Sunt de acord cu <span className="text-primary underline">regulamentul sălii</span>, inclusiv clauza de răspundere.
                            </label>
                        </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary text-primary-foreground py-6 text-base font-bold shadow-lg" 
                      disabled={isSubmitting || !name.trim() || !agreed}
                    >
                        {isSubmitting ? 'Se creează contul...' : 'Finalizează Înregistrarea'}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}