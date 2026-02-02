'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuth, signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

export default function ProfilePage() {
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
    
    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push('/');
    };

    const loading = userLoading || memberLoading;

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const displayName = memberData?.name || user.displayName;
    const displayEmail = memberData?.email || user.email;
    const displayPhotoUrl = memberData?.photoURL || user.photoURL;

    return (
        <div className="space-y-8">
            <Card className="max-w-md mx-auto glass">
                <CardHeader>
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={displayPhotoUrl || ''} alt={displayName || ''} />
                            <AvatarFallback className="text-3xl">
                                {displayName?.charAt(0) || displayEmail?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-center">{displayName}</CardTitle>
                        <p className="text-muted-foreground">{displayEmail}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
