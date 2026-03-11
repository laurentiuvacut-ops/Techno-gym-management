'use client';
import { subscriptions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMember } from '@/contexts/member-context';
import { motion } from 'framer-motion';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';

export default function PlansTab() {
  const { memberData } = useMember();
  const { setActiveTab } = useDashboardNav();
  
  const currentSubscription = memberData?.subscriptionType ? subscriptions.find(sub => sub.title === memberData.subscriptionType) : null;
  const currentPlanId = currentSubscription?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setActiveTab('home')}
        className="text-white hover:text-primary gap-2 h-9 px-4 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Acasa
      </Button>

      <div className="flex flex-col gap-6">
        <div className="space-y-1 text-center">
            <h1 className="text-4xl font-headline tracking-wider">Abonamente</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Toate abonamentele se achiziționează direct la recepția sălii.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptions.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPopular = (plan as any).popular;
          const isFeatured = isCurrent || isPopular;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative p-6 rounded-3xl h-full flex flex-col transition-all duration-300",
                isFeatured ? "bg-gradient-primary text-primary-foreground glow-primary" : "glass"
              )}
            >
              {isCurrent && (
                <Badge variant="secondary" className="absolute top-4 right-4">Planul Actual</Badge>
              )}
               {isPopular && !isCurrent && (
                <Badge variant="secondary" className="absolute top-4 right-4 flex items-center gap-1">
                  <Star className="w-3 h-3"/> Popular
                </Badge>
              )}
              
              <div className="flex-grow">
                <h3 className="text-2xl font-headline">{plan.title}</h3>
                <p className={cn("text-sm", isFeatured ? "text-primary-foreground/80" : "text-muted-foreground")}>{plan.description}</p>
                
                <div className="my-6">
                  <span className={cn("text-5xl font-bold", !isFeatured && "text-gradient")}>{plan.price.split(' ')[0]}</span>
                  <span className={cn("text-lg", isFeatured ? "text-primary-foreground/80" : "text-muted-foreground")}> {plan.price.split(' ')[1]}{plan.period}</span>
                </div>

                <ul className="space-y-3">
                  {plan.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", isFeatured ? "bg-white/20" : "bg-primary/20")}>
                        <Check className={cn("w-3.5 h-3.5", isFeatured ? "text-primary-foreground" : "text-primary")} />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <div className="text-center p-4 rounded-2xl bg-black/20 border border-white/10">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Se cumpără în locație</p>
                  <p className="text-[10px] text-muted-foreground italic leading-tight">Vizitează recepția sălii pentru activarea acestui plan.</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
