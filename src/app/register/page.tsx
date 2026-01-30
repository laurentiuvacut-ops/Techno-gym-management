'use client';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

const registerSchema = z.object({
    displayName: z.string().min(3, { message: "Numele trebuie să aibă cel puțin 3 caractere." }),
    email: z.string().email({ message: "Adresa de email este invalidă." }),
    password: z.string().min(6, { message: "Parola trebuie să aibă cel puțin 6 caractere." }),
});

export default function RegisterPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const auth = useAuth();
    const firestore = useFirestore();
    const [firebaseError, setFirebaseError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            displayName: "",
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
        setFirebaseError(null);
        if (!auth || !firestore) {
            setFirebaseError("Serviciile Firebase nu sunt disponibile. Vă rugăm să reîncărcați pagina.");
            return;
        }
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const authUser = userCredential.user;

            // Update Firebase Auth profile
            await updateProfile(authUser, {
                displayName: values.displayName,
            });

            // Create member document in Firestore
            const memberDocRef = doc(firestore, 'members', authUser.uid);
            await setDoc(memberDocRef, {
                id: authUser.uid,
                name: values.displayName,
                email: values.email,
                photoURL: null,
                qrCode: `technogym-member-${authUser.uid}`, // Placeholder QR code
                status: 'Expired',
                daysRemaining: 0,
                subscriptionId: null,
            });
            
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Error signing up:", error);
            if (error.code === 'auth/email-already-in-use') {
                setFirebaseError("Acest email este deja folosit.");
            } else if (error.code === 'auth/configuration-not-found') {
                setFirebaseError("Configurarea de autentificare nu a fost găsită. Contactați suportul.");
            } else {
                setFirebaseError("A apărut o eroare la înregistrare. Vă rugăm să încercați din nou.");
            }
        }
    };
    
    if (loading || user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Creează Cont</CardTitle>
                    <CardDescription>Alătură-te comunității noastre.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nume Complet</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nume Prenume" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="exemplu@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parolă</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             {firebaseError && <p className="text-sm font-medium text-destructive">{firebaseError}</p>}
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Se creează contul...' : 'Înregistrare'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                 <CardFooter className="text-center text-sm">
                    <p>Ai deja cont? <Link href="/login" className="text-primary hover:underline">Autentifică-te</Link></p>
                </CardFooter>
            </Card>
        </div>
    );
}
