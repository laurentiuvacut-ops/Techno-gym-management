'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/layout/dashboard-sidebar';
import DashboardHeader from '@/components/layout/dashboard-header';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col h-screen overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto relative outline-none overscroll-contain">
            {mounted && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="w-full px-4 md:px-8 py-4 md:py-6 mx-auto selectable-text"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}