'use client';
import { useEffect } from 'react';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import DashboardMaster from '@/components/dashboard/dashboard-master';

export default function ProgressPage() {
  const { setActiveTab } = useDashboardNav();
  useEffect(() => { setActiveTab('progress'); }, [setActiveTab]);
  return <DashboardMaster />;
}
