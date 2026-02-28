'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { useMember } from '@/contexts/member-context';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

export default function DashboardHeader() {
  const { user, isUserLoading } = useUser();
  const { memberData } = useMember();
  const { setActiveTab } = useDashboardNav();
  const { toggleSidebar } = useSidebar();
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

  const displayPhotoUrl = memberData?.photoURL || user?.photoURL || undefined;
  const displayName = memberData?.name || user?.displayName || 'U';

  return (
    <header className={cn(
        "sticky top-0 z-10 flex h-16 items-center gap-4 px-4 md:px-6 transition-all duration-300",
        scrolled ? "glass" : "bg-transparent"
    )}>
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSidebar}
          className="gap-2 h-10 px-4 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-all font-headline tracking-widest uppercase text-xs"
        >
          <Menu className="w-4 h-4 text-primary" />
          Meniu
        </Button>
      </div>
      <div className="flex-1" />
      {mounted && !isUserLoading && user && (
        <button onClick={() => setActiveTab('profile')}>
          <Avatar className="h-9 w-9 border border-primary/20">
            <AvatarImage src={displayPhotoUrl} alt={displayName} className="object-cover" />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      )}
    </header>
  );
}
