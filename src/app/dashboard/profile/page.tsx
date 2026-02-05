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
import { ArrowLeft, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { subscriptions } from '@/lib/data';

export default function ProfilePage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const memberDocRef = useMemo(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'members', user.uid);
    }, [firestore, user]);

    const { data: memberData, isLoading: memberLoading } = useDoc(memberDocRef);
    
    const currentSubscription = useMemo(() => {
        if (!memberData) return null;
        return subscriptions.find(sub => sub.id === memberData.subscriptionId);
    }, [memberData]);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);
    
    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push('/');
    };

    const loading = userLoading || memberLoading;

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const displayName = memberData?.name || user.displayName;
    const displayEmail = memberData?.email || user.email;
    const displayPhone = memberData?.phone || user.phoneNumber;
    const displayPhotoUrl = memberData?.photoURL || user.photoURL;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto space-y-8"
        >
            <Button asChild variant="outline" className="w-fit">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Înapoi la Panou
                </Link>
            </Button>
            <Card className="glass rounded-3xl">
                <CardHeader className="items-center text-center">
                    <Avatar className="w-24 h-24 border-4 border-primary/50">
                        <AvatarImage src={displayPhotoUrl || ''} alt={displayName || ''} />
                        <AvatarFallback className="text-3xl bg-muted">
                            {displayName?.charAt(0) || displayEmail?.charAt(0) || 'T'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="pt-4">
                        <CardTitle className="text-3xl font-headline">{displayName}</CardTitle>
                        <CardDescription>{displayEmail || 'Fără email'}</CardDescription>
                        <CardDescription>{displayPhone}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                     {currentSubscription && (
                        <div className="mb-6 space-y-3 text-center border-b border-border/50 pb-6">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                                <Award className="h-4 w-4" />
                                Abonament Actual
                            </h4>
                            <Badge className="text-base font-semibold" variant="outline">{currentSubscription.title}</Badge>
                        </div>
                    )}
                    <Button variant="outline" className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50" onClick={handleSignOut}>
                        Deconectare
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
