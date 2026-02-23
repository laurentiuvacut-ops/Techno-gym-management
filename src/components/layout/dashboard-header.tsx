'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function DashboardHeader() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
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

  const memberDocRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return doc(firestore, 'members', user.phoneNumber);
  }, [firestore, user]);

  const { data: memberData } = useDoc(memberDocRef);

  const displayPhotoUrl = memberData?.photoURL || user?.photoURL || '';
  const displayName = memberData?.name || user?.displayName || 'U';

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
            <AvatarImage src={displayPhotoUrl} alt={displayName} className="object-cover" />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
      )}
    </header>
  );
}
