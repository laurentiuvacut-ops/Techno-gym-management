'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/layout/dashboard-sidebar';
import DashboardHeader from '@/components/layout/dashboard-header';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { MemberProvider } from '@/contexts/member-context';
import { DashboardNavProvider } from '@/contexts/dashboard-nav-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user && mounted) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, mounted]);

  if (isUserLoading && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isUserLoading && !user) return null;

  return (
    <DashboardNavProvider>
      <SidebarProvider defaultOpen={true}>
        <MemberProvider>
          <div className="flex min-h-screen w-full bg-background">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col h-screen overflow-hidden">
              <DashboardHeader />
              <main className="flex-1 overflow-y-auto relative outline-none overscroll-contain scroll-smooth">
                <div className="w-full px-4 md:px-8 py-4 md:py-6 mx-auto selectable-text">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </MemberProvider>
      </SidebarProvider>
    </DashboardNavProvider>
  );
}
