'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, loading } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full py-3 px-4 transition-all duration-300 bg-transparent border-b border-transparent"
    )}>
      {/* Logo */}
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
      
      {/* Auth logic */}
      {(!isClient || loading) ? (
        // Skeleton loader for the button
        <div className="h-9 w-28 rounded-lg bg-muted/50 animate-pulse" />
      ) : user ? (
        // Avatar for logged-in user
        <Link href="/dashboard/profile">
          <Avatar className='w-9 h-9'>
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
      ) : (
        // Login button for logged-out user
        <Button asChild className="h-auto px-4 py-2 text-sm font-semibold rounded-lg glow-primary">
           <Link href="/login">
               Intră în Cont
           </Link>
       </Button>
      )}
    </header>
  );
}
