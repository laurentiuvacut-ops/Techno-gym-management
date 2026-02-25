'use client';
import { useEffect } from 'react';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import DashboardMaster from '@/components/dashboard/dashboard-master';

export default function PlansPage() {
  const { setActiveTab } = useDashboardNav();
  useEffect(() => { setActiveTab('plans'); }, [setActiveTab]);
  return <DashboardMaster />;
}
