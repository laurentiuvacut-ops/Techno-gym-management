'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, loading } = useUser();
  const [visible, setVisible] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setIsClient(true);

    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Hide header if scrolling down, show if scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      // Update the ref's value without causing a re-render
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', controlHeader);

    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, []);

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full py-3 px-4 transition-transform duration-300 bg-transparent",
        visible ? 'translate-y-0' : '-translate-y-full'
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
      
      {/* Auth logic: Use a container to prevent layout shift and ensure client/server match */}
      <div className="flex justify-end items-center h-9 w-28">
        {!isClient || loading ? (
          // Skeleton loader for server-side rendering and initial client-side loading.
          // This ensures the initial UI is identical on both client and server.
          <div className="h-full w-full rounded-lg bg-muted/50 animate-pulse" />
        ) : user ? (
          // Avatar for logged-in user, rendered only on the client after hydration
          <Link href="/dashboard/profile">
            <Avatar className='h-9 w-9'>
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          // Login button for logged-out user, rendered only on the client after hydration
          <Button asChild size="lg" className="glow-primary h-auto px-4 py-2 text-sm font-semibold rounded-lg">
             <Link href="/login">
                 Intră în Cont
             </Link>
         </Button>
        )}
      </div>
    </header>
  );
}
