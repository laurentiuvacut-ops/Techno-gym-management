'use client';
import { useEffect } from 'react';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import DashboardMaster from '@/components/dashboard/dashboard-master';

export default function ProfilePage() {
  const { setActiveTab } = useDashboardNav();
  useEffect(() => { setActiveTab('profile'); }, [setActiveTab]);
  return <DashboardMaster />;
}
