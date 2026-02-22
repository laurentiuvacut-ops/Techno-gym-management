
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function DashboardHeader() {
  const { user, isUserLoading } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mainContent = document.querySelector('main');
    
    const handleScroll = () => {
      if (mainContent) {
        setScrolled(mainContent.scrollTop > 10);
      }
    };

    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <header className={cn(
        "sticky top-0 z-10 flex h-16 items-center gap-4 px-4 md:px-6 transition-all duration-300",
        scrolled ? "glass" : "bg-transparent"
    )}>
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1" />
      {mounted && !isUserLoading && user && (
        <Link href="/dashboard/profile">
          <Avatar className="h-9 w-9 border border-primary/20">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
      )}
    </header>
  );
}
