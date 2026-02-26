'use client';

import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import { useMember } from '@/contexts/member-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// Home se încarcă imediat (e prima pagină vizibilă)
import HomeTab from '@/components/dashboard/home-tab';

// Restul se încarcă DOAR când user-ul navighează la ele
const ShopTab = lazy(() => import('@/components/dashboard/shop-tab'));
const PlansTab = lazy(() => import('@/components/dashboard/plans-tab'));
const TrainersTab = lazy(() => import('@/components/dashboard/trainers-tab'));
const WorkoutsTab = lazy(() => import('@/components/dashboard/workouts-tab'));
const FeedbackTab = lazy(() => import('@/components/dashboard/feedback-tab'));
const ViewFeedbackTab = lazy(() => import('@/components/dashboard/view-feedback-tab'));
const ProfileTab = lazy(() => import('@/components/dashboard/profile-tab'));
const ProgressTab = lazy(() => import('@/components/dashboard/progress-tab'));
const CheckinsTab = lazy(() => import('@/components/dashboard/checkins-tab'));

const tabs = {
  home: HomeTab,
  shop: ShopTab,
  plans: PlansTab,
  trainers: TrainersTab,
  workouts: WorkoutsTab,
  feedback: FeedbackTab,
  'view-feedback': ViewFeedbackTab,
  profile: ProfileTab,
  progress: ProgressTab,
  checkins: CheckinsTab,
} as const;

function TabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-40 w-full rounded-3xl" />
    </div>
  );
}

export default function DashboardMaster() {
  const { activeTab } = useDashboardNav();
  const { memberData, isLoading } = useMember();
  const reduced = useReducedMotion();
  
  const ActiveComponent = tabs[activeTab];

  if (!isLoading && !memberData) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-headline mb-2 uppercase tracking-wider text-white">Finalizează-ți contul</h1>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">Profilul tău de membru nu a fost găsit. Te rugăm să completezi înregistrarea pentru a accesa panoul de control.</p>
            <Button asChild size="lg" className="glow-primary">
                <a href="/register">Finalizează Înregistrarea</a>
            </Button>
        </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: reduced ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.15 }}
      >
        <Suspense fallback={<TabSkeleton />}>
          <ActiveComponent />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
