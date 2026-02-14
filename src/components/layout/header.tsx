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
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);

  // This effect runs once on the client after the component mounts.
  useEffect(() => {
    setMounted(true);
  }, []);

  // This effect sets up the scroll listener, also only on the client.
  useEffect(() => {
    // This check ensures the code inside only runs on the client.
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show header if scrolling up or near the top
      setVisible(currentScrollY < lastScrollY.current || currentScrollY < 50);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array ensures this runs only once.

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full py-3 px-4 transition-transform duration-300",
        // On the server, `visible` is always true, so 'translate-y-0' is rendered.
        // On the client, this class is updated by the scroll listener.
        visible ? 'translate-y-0' : '-translate-y-full'
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
        {/*
          This is the key to fixing the hydration error.
          - On the server, `mounted` is false, so the placeholder is rendered.
          - On the initial client render, `mounted` is also false, so the placeholder is rendered. This matches the server.
          - After mounting, `useEffect` sets `mounted` to true, and we can safely render client-only UI.
          - We wait for `loading` to be false to ensure we have the auth state.
        */}
        {mounted && !loading ? (
            <>
              {user ? (
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
            </>
        ) : (
          // This placeholder is rendered on the server and on the initial client load.
          <div className="h-9 w-full rounded-lg bg-muted/50 animate-pulse" />
        )}
      </div>
    </header>
  );
}
