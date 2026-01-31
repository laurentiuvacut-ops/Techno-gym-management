'use client';

import { User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';

export default function Header() {
  const { user, loading } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm z-50 flex items-center border-b">
      <div className="container mx-auto px-4 w-full flex justify-between items-center">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
           <Image src="https://i.imgur.com/QdArxUJ.png" alt="Techno Gym Logo" width={32} height={32} className="object-contain" />
           <span className="text-xl font-bold tracking-tight"><span className="text-primary">TECHNO</span><span className="text-foreground">GYM</span></span>
        </Link>
        
        {loading ? (
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        ) : user ? (
          <Link href="/profile">
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
    