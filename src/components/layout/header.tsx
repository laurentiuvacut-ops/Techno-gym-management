'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, loading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
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
