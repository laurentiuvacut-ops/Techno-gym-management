'use client';

import React, { motion, AnimatePresence } from 'framer-motion';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import { useMember } from '@/contexts/member-context';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Importuri statice pentru viteză instantanee
import HomeTab from '@/components/dashboard/home-tab';
import ShopTab from '@/components/dashboard/shop-tab';
import PlansTab from '@/components/dashboard/plans-tab';
import TrainersTab from '@/components/dashboard/trainers-tab';
import WorkoutsTab from '@/components/dashboard/workouts-tab';
import FeedbackTab from '@/components/dashboard/feedback-tab';
import ViewFeedbackTab from '@/components/dashboard/view-feedback-tab';
import ProfileTab from '@/components/dashboard/profile-tab';
import ProgressTab from '@/components/dashboard/progress-tab';
import CheckinsTab from '@/components/dashboard/checkins-tab';

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

class TabErrorBoundary extends React.Component<{ children: React.ReactNode, activeTab: string }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.activeTab !== this.props.activeTab) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center glass rounded-3xl border-destructive/20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive opacity-50" />
          <h2 className="text-xl font-headline tracking-wide uppercase">Secțiune Indisponibilă</h2>
          <p className="text-xs text-muted-foreground italic">Momentan nu putem încărca aceste date.</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="text-[10px] uppercase font-bold tracking-widest gap-2"
          >
            <RefreshCw className="w-3 h-3" /> Reîncarcă Pagina
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
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
        <TabErrorBoundary activeTab={activeTab}>
          <Suspense fallback={<div className="space-y-4"><Skeleton className="h-12 w-1/2" /><Skeleton className="h-64 w-full" /></div>}>
            <ActiveComponent />
          </Suspense>
        </TabErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
}
