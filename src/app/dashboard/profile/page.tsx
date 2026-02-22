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
import { ArrowLeft, Award, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { subscriptions } from '@/lib/data';

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
        <div className="max-w-md mx-auto space-y-6">
            <Button asChild variant="ghost" className="w-fit">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Înapoi
                </Link>
            </Button>
            
            <Card className="glass rounded-3xl border-0 overflow-hidden">
                <CardHeader className="items-center text-center pb-2">
                    <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-xl">
                        <AvatarImage src={displayPhotoUrl || ''} alt={displayName || ''} />
                        <AvatarFallback className="text-3xl bg-muted font-headline">
                            {displayName?.charAt(0) || displayEmail?.charAt(0) || 'T'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="pt-4 space-y-1">
                        <CardTitle className="text-3xl font-headline tracking-wide">{displayName}</CardTitle>
                        <CardDescription className="font-medium text-primary/80">{displayPhone}</CardDescription>
                        {displayEmail && <CardDescription>{displayEmail}</CardDescription>}
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                     {currentSubscription && (
                        <div className="mb-6 space-y-3 text-center bg-foreground/5 rounded-2xl p-4">
                            <h4 className="text-xs font-bold text-muted-foreground flex items-center justify-center gap-2 uppercase tracking-widest">
                                <Award className="h-4 w-4 text-primary" />
                                Plan Activ
                            </h4>
                            <Badge className="text-base font-semibold py-1 px-4" variant="outline">{currentSubscription.title}</Badge>
                        </div>
                    )}
                    <Button 
                      variant="destructive" 
                      className="w-full h-12 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all duration-300 border-destructive/20" 
                      onClick={handleSignOut}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Deconectare
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}