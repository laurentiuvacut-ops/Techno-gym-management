'use client';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuth, signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Award, LogOut, Check, Home, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { subscriptions } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const memberDocRef = useMemo(() => {
        if (!firestore || !user?.phoneNumber) return null;
        return doc(firestore, 'members', user.phoneNumber);
    }, [firestore, user]);

    const { data: memberData, isLoading: memberLoading } = useDoc(memberDocRef);
    
    const currentSubscription = useMemo(() => {
        if (!memberData || !memberData.subscriptionType) return null;
        return subscriptions.find(sub => sub.title === memberData.subscriptionType);
    }, [memberData]);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);
    
    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push('/');
    };

    const loading = isUserLoading || memberLoading;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || (!memberLoading && !memberData)) return null;

    const displayName = memberData?.name || user.displayName;
    const displayEmail = memberData?.email || user.email;
    const displayPhone = memberData?.phone || user.phoneNumber;
    const displayPhotoUrl = memberData?.photoURL || user.photoURL;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto space-y-6 pb-12"
        >
            <Button asChild variant="ghost" className="w-fit mb-2">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Înapoi
                </Link>
            </Button>
            
            <Card className="glass rounded-3xl border-0 overflow-hidden shadow-2xl">
                <CardHeader className="items-center text-center pb-2 bg-foreground/5 pt-8">
                    <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-xl">
                        <AvatarImage src={displayPhotoUrl || ''} alt={displayName || ''} />
                        <AvatarFallback className="text-3xl bg-muted font-headline">
                            {displayName?.charAt(0) || displayEmail?.charAt(0) || 'T'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="pt-4 space-y-1">
                        <CardTitle className="text-3xl font-headline tracking-wide">{displayName}</CardTitle>
                        <CardDescription className="font-medium text-primary/80">{displayPhone}</CardDescription>
                        {displayEmail && <CardDescription className="text-xs opacity-60">{displayEmail}</CardDescription>}
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                     {currentSubscription ? (
                        <div className="space-y-6">
                            <div className="space-y-3 text-center bg-primary/10 rounded-2xl p-4 border border-primary/20">
                                <h4 className="text-[10px] font-bold text-primary flex items-center justify-center gap-2 uppercase tracking-[0.2em]">
                                    <Award className="h-4 w-4" />
                                    Plan Activ
                                </h4>
                                <Badge className="text-base font-semibold py-1 px-4 bg-primary text-primary-foreground border-none" variant="default">
                                    {currentSubscription.title}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                                    Beneficii Incluse
                                </h4>
                                <ul className="space-y-3">
                                    {currentSubscription.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground/90">
                                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="h-3 w-3 text-primary" />
                                            </div>
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-6 bg-destructive/10 rounded-2xl border border-destructive/20">
                            <p className="text-sm font-medium text-destructive">Niciun abonament activ găsit.</p>
                            <Button asChild variant="link" className="text-xs h-auto p-0 mt-2">
                                <Link href="/dashboard/plans">Vezi abonamente disponibile</Link>
                            </Button>
                        </div>
                    )}
                    
                    <Separator className="bg-border/30" />

                    <Button 
                      variant="destructive" 
                      className="w-full h-14 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all duration-300 border border-destructive/20 font-bold" 
                      onClick={handleSignOut}
                    >
                        <LogOut className="mr-2 h-5 w-5" />
                        Deconectare Cont
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard">
                    <div className="glass p-5 rounded-3xl flex flex-col items-center justify-center gap-3 aspect-square transition-all duration-300 hover:border-primary/40 active:scale-[0.96] group">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Home className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xs font-headline tracking-widest uppercase">Acasa</span>
                    </div>
                </Link>
                <Link href="/dashboard/shop">
                    <div className="glass p-5 rounded-3xl flex flex-col items-center justify-center gap-3 aspect-square transition-all duration-300 hover:border-primary/40 active:scale-[0.96] group">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <ShoppingBag className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xs font-headline tracking-widest uppercase">Shop &amp; Stoc</span>
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}