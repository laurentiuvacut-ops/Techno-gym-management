'use client';
import { useEffect } from 'react';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import DashboardMaster from '@/components/dashboard/dashboard-master';

export default function CheckinsPage() {
  const { setActiveTab } = useDashboardNav();
  useEffect(() => { setActiveTab('checkins'); }, [setActiveTab]);
  return <DashboardMaster />;
}