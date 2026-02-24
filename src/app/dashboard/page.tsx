'use client';

import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import { useMember } from '@/contexts/member-context';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import HomeTab from '@/components/dashboard/home-tab';
import ShopTab from '@/components/dashboard/shop-tab';
import PlansTab from '@/components/dashboard/plans-tab';
import TrainersTab from '@/components/dashboard/trainers-tab';
import WorkoutsTab from '@/components/dashboard/workouts-tab';
import FeedbackTab from '@/components/dashboard/feedback-tab';
import ViewFeedbackTab from '@/components/dashboard/view-feedback-tab';
import ProfileTab from '@/components/dashboard/profile-tab';

const tabs = {
  home: HomeTab,
  shop: ShopTab,
  plans: PlansTab,
  trainers: TrainersTab,
  workouts: WorkoutsTab,
  feedback: FeedbackTab,
  'view-feedback': ViewFeedbackTab,
  profile: ProfileTab,
} as const;

export default function DashboardPage() {
  const { activeTab } = useDashboardNav();
  const { memberData, isLoading } = useMember();
  
  const ActiveComponent = tabs[activeTab];

  // Show a clean loader while synchronizing member data
  if (isLoading && !memberData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Handle case where user is authenticated but doesn't have a profile yet
  if (!isLoading && !memberData) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-headline mb-2 uppercase tracking-wider">Finalizează-ți contul</h1>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">Profilul tău de membru nu a fost găsit. Te rugăm să completezi înregistrarea pentru a accesa panoul de control.</p>
            <Button asChild size="lg" className="glow-primary">
                <a href="/register">Finalizează Înregistrarea</a>
            </Button>
        </div>
    );
  }

  return <ActiveComponent />;
}
