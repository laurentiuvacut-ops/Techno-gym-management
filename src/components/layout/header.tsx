'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, loading } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 h-16 z-50 flex items-center transition-all duration-300",
        scrolled ? "glass-strong" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
           <div className="relative w-8 h-8">
            <Image 
              src="https://i.imgur.com/9W1ye1w.png" 
              alt="Techno Gym Logo" 
              fill
              className="object-contain"
            />
           </div>
           <span className="text-xl font-bold tracking-tight"><span className="text-primary">TECHNO</span><span className="text-foreground">GYM</span></span>
        </Link>
        
        {(!isClient || loading) ? (
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        ) : user ? (
          <Link href="/dashboard/profile">
            <Avatar className='w-8 h-8'>
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
            <div className="flex items-center gap-2">
                 <Button asChild>
                    <Link href="/login">
                        Intră în Cont
                    </Link>
                </Button>
            </div>
        )}

      </div>
    </header>
  );
}
    
