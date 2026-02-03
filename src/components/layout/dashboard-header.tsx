'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function DashboardHeader() {
  const { user, loading } = useUser();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1" />
      {(!loading && user) && (
        <Link href="/dashboard/profile">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
      )}
    </header>
  );
}
