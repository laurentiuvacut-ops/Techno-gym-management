'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { useMemo, useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, isUserLoading: loading } = useUser();
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const memberDocRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return doc(firestore, 'members', user.phoneNumber);
  }, [firestore, user]);

  const { data: memberData } = useDoc(memberDocRef);

  const displayPhotoUrl = memberData?.photoURL || user?.photoURL || '';
  const displayName = memberData?.name || user?.displayName || 'U';

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full py-3 px-4 bg-background/80 backdrop-blur-md border-b border-border/50"
    )}>
       <Link href="/" className="flex items-center gap-2">
         <div className="relative w-9 h-9">
            <Image
              src="https://i.imgur.com/9W1ye1w.png"
              alt="Techno Gym Logo"
              fill
              className="object-contain"
            />
         </div>
         <span className="text-lg font-bold">
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">TECHNO</span>
            <span className="text-white">GYM</span>
         </span>
      </Link>
      
      <div className="flex justify-end items-center min-h-[40px] w-28">
        {!mounted || loading ? (
            <div className="h-9 w-full rounded-lg bg-muted/50 animate-pulse" />
        ) : user ? (
            <Link href="/dashboard/profile">
              <Avatar className='h-9 w-9'>
                <AvatarImage src={displayPhotoUrl} alt={displayName} className="object-cover" />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
        ) : (
           <Button asChild className="glow-primary h-auto px-4 py-2 text-sm font-semibold rounded-lg">
               <Link href="/login">
                   Intră în Cont
               </Link>
           </Button>
        )}
      </div>
    </header>
  );
}
