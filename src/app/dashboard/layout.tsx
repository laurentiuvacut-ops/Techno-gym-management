'use client';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/layout/dashboard-sidebar';
import DashboardHeader from '@/components/layout/dashboard-header';
import { motion, type PanInfo } from 'framer-motion';

// We create a new component to be able to use the `useSidebar` hook,
// which needs to be a child of `SidebarProvider`.
function DraggableContent({ children }: { children: React.ReactNode }) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    // This condition checks for a firm swipe to the right.
    if (isMobile && info.offset.x > 50 && info.velocity.x > 100) {
      setOpenMobile(true);
    }
  };

  return (
    // This `motion.div` wraps the main content area that will be draggable.
    <motion.div
      className="flex flex-1 flex-col"
      // Enable dragging only on the x-axis, and only on mobile.
      drag={isMobile ? "x" : false}
      // Prevent the content from being permanently dragged out of place.
      dragConstraints={{ left: 0, right: 0 }}
      // Add a slight "rubber band" effect for visual feedback when dragging.
      dragElastic={{ left: 0.1, right: 0 }}
      // Define a snap-back transition.
      dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
      onDragEnd={handleDragEnd}
      // This is crucial: it tells the browser we're handling horizontal
      // gestures, but it should still manage vertical scrolling (pan-y).
      style={{ touchAction: "pan-y" }}
    >
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </motion.div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* The `overflow-hidden` on this container prevents the whole page from
          scrolling horizontally when the content is dragged. */}
      <div className="flex min-h-screen w-full bg-background overflow-hidden">
        <DashboardSidebar />
        <DraggableContent>
          {children}
        </DraggableContent>
      </div>
    </SidebarProvider>
  );
}
