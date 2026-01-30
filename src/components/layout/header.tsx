'use client';

import { Dumbbell, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function Header() {
  const { user, loading } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm z-50 flex items-center">
      <div className="container mx-auto px-4 w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="text-primary w-8 h-8" />
          <h1 className="text-xl font-bold text-white tracking-tighter">
            TECHNO<span className="font-light">GYM</span>
          </h1>
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
          <Link href="/login">
            <Button variant="ghost" size="icon">
                <User className="text-white/80" />
            </Button>
          </Link>
        )}

      </div>
    </header>
  );
}
