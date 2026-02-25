'use client';
import { useEffect } from 'react';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import DashboardMaster from '@/components/dashboard/dashboard-master';

export default function TrainersPage() {
  const { setActiveTab } = useDashboardNav();
  useEffect(() => { setActiveTab('trainers'); }, [setActiveTab]);
  return <DashboardMaster />;
}
