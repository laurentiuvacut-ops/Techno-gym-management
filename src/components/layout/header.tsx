'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dumbbell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, loading } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full py-3 px-4 transition-all duration-300",
        scrolled ? "bg-black/95 backdrop-blur-xl border-b border-border" : "bg-transparent border-b border-transparent"
    )}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
         <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-600">
          <Dumbbell className="w-5 h-5 text-white" />
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
        <Button asChild className="h-auto px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 transition-all hover:from-cyan-600 hover:to-cyan-700">
           <Link href="/login">
               Intră în Cont
           </Link>
       </Button>
      )}
    </header>
  );
}
