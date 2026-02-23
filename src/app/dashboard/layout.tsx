'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/layout/dashboard-sidebar';
import DashboardHeader from '@/components/layout/dashboard-header';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Centralized Auth Guard - Redirect only if we ARE NOT loading and user is missing
  useEffect(() => {
    if (!isUserLoading && !user && mounted) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, mounted]);

  // Show a SINGLE global spinner only on the very first load of the app
  if (isUserLoading && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If we are not loading and have no user, don't render anything (redirect will happen)
  if (!isUserLoading && !user) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col h-screen overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto relative outline-none overscroll-contain scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.15, ease: "linear" }}
                className="w-full px-4 md:px-8 py-4 md:py-6 mx-auto selectable-text"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
