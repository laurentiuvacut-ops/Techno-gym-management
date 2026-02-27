'use client';
import { useEffect, Suspense } from 'react';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import DashboardMaster from '@/components/dashboard/dashboard-master';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlansPage() {
  const { setActiveTab } = useDashboardNav();
  useEffect(() => { setActiveTab('plans'); }, [setActiveTab]);
  
  return (
    <Suspense fallback={<div className="space-y-6"><Skeleton className="h-12 w-1/2 rounded-xl"/><Skeleton className="h-96 w-full rounded-3xl"/></div>}>
      <DashboardMaster />
    </Suspense>
  );
}
