'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type DashboardTab = 'home' | 'shop' | 'plans' | 'trainers' | 'workouts' | 'feedback' | 'view-feedback' | 'profile' | 'progress' | 'checkins';

type DashboardNavContextType = {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
};

const DashboardNavContext = createContext<DashboardNavContextType>({
  activeTab: 'home',
  setActiveTab: () => {},
});

export function DashboardNavProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');

  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (searchParams.has('plan_id') || searchParams.has('payment_success')) {
      setActiveTab('plans');
      return;
    }
    
    if (path.includes('/shop')) setActiveTab('shop');
    else if (path.includes('/trainers')) setActiveTab('trainers');
    else if (path.includes('/workouts')) setActiveTab('workouts');
    else if (path.includes('/view-feedback')) setActiveTab('view-feedback');
    else if (path.includes('/feedback')) setActiveTab('feedback');
    else if (path.includes('/profile')) setActiveTab('profile');
    else if (path.includes('/plans')) setActiveTab('plans');
    else if (path.includes('/progress')) setActiveTab('progress');
    else if (path.includes('/checkins')) setActiveTab('checkins');
  }, []);

  useEffect(() => {
    const urlMap: Record<DashboardTab, string> = {
      'home': '/dashboard',
      'shop': '/dashboard/shop',
      'plans': '/dashboard/plans',
      'trainers': '/dashboard/trainers',
      'workouts': '/dashboard/workouts',
      'feedback': '/dashboard/feedback',
      'view-feedback': '/dashboard/view-feedback',
      'profile': '/dashboard/profile',
      'progress': '/dashboard/progress',
      'checkins': '/dashboard/checkins',
    };
    
    const currentSearch = window.location.search;
    const newPath = urlMap[activeTab];
    
    if (window.location.pathname !== newPath) {
      window.history.replaceState(null, '', newPath + (activeTab === 'plans' ? currentSearch : ''));
    }
  }, [activeTab]);

  return (
    <DashboardNavContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </DashboardNavContext.Provider>
  );
}

export function useDashboardNav() {
  return useContext(DashboardNavContext);
}

export type { DashboardTab };