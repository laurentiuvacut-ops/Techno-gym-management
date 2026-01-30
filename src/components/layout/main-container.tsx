'use client';
import { usePathname } from 'next/navigation';

export default function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // No padding for the root landing page
  const noPaddingRoutes = ['/'];

  if (noPaddingRoutes.includes(pathname)) {
    // pt-16 to account for the fixed header height
    return <main className="min-h-screen pt-16">{children}</main>;
  }

  // Padding for all other authenticated pages
  return (
    <main className="min-h-screen pt-20 pb-24 px-4 container mx-auto">
      {children}
    </main>
  );
}
