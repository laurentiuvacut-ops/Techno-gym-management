
'use client';
import { subscriptions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, LinkIcon, ArrowLeft, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from '@/firebase';
import { useMember } from '@/contexts/member-context';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/ai/flows/create-checkout-session";
import { useDashboardNav } from '@/contexts/dashboard-nav-context';

export default function PlansTab() {
  const { user } = useUser();
  const { memberData, isLoading: memberLoading } = useMember();
  const { setActiveTab } = useDashboardNav();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(false);
  const [webhookTimeout, setWebhookTimeout] = useState(false);

  const paymentSuccess = searchParams.get('payment_success') === 'true';
  const planIdParam = searchParams.get('plan_id');

  useEffect(() => {
    if (paymentSuccess) {
      setIsWaitingForWebhook(true);
      
      // Auto-hide the "Processing" message after 15 seconds if nothing happens
      const timer = setTimeout(() => {
        setWebhookTimeout(true);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [paymentSuccess]);

  // If memberData updates and reflects the active plan, stop waiting
  useEffect(() => {
    if (isWaitingForWebhook && memberData?.status === 'Activ' && memberData?.subscriptionType === subscriptions.find(s => s.id === planIdParam)?.title) {
      setIsWaitingForWebhook(false);
      toast({
        title: "Abonament Activat!",
        description: "Plata a fost procesată și accesul tău a fost actualizat.",
        className: "bg-success text-success-foreground",
      });
    }
  }, [memberData, isWaitingForWebhook, planIdParam, toast]);

  const handlePurchase = async (plan: any) => {
    setCheckoutUrl(null);
    if (!user?.phoneNumber) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Trebuie să fii autentificat pentru a efectua o plată.",
      });
      return;
    }

    setIsUpdating(plan.id);

    try {
        const baseUrl = window.location.origin;
        const { url, error: stripeError } = await createCheckoutSession({
            userId: user.uid,
            baseUrl: baseUrl,
            planId: plan.id,
            planTitle: plan.title,
            planPrice: plan.price,
        });

        if (url) {
            setCheckoutUrl(url);
        } else {
            toast({
                variant: "destructive",
                title: "Eroare",
                description: stripeError || "Nu s-a putut crea sesiunea de plată.",
            });
            setIsUpdating(null);
        }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: error.message || 'Eroare necunoscută.',
      });
      setIsUpdating(null);
    }
  };
  
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
            <p className="text-muted-foreground max-w-2xl mx-auto">Alege planul care ți se potrivește.</p>
        </div>
      </div>

      {isWaitingForWebhook && (
          <div className="flex flex-col items-center justify-center p-8 glass rounded-3xl gap-4 border-primary/30 animate-in fade-in duration-500">
              {webhookTimeout ? (
                <>
                  <Info className="w-10 h-10 text-warning" />
                  <div className="text-center">
                    <p className="text-lg font-bold">Procesarea durează mai mult...</p>
                    <p className="text-sm text-muted-foreground">Plata a fost înregistrată, dar activarea poate dura câteva minute. Dacă abonamentul nu apare activ în curând, te rugăm să ne contactezi.</p>
                  </div>
                  <Button variant="outline" onClick={() => setIsWaitingForWebhook(false)} className="rounded-xl border-white/10">Închide Mesajul</Button>
                </>
              ) : (
                <>
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <div className="text-center">
                    <p className="text-lg font-bold">Plata a fost finalizată!</p>
                    <p className="text-sm text-muted-foreground">Se activează abonamentul tău... Te rugăm să nu închizi pagina.</p>
                  </div>
                </>
              )}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptions.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPopular = (plan as any).popular;
          const isFeatured = isCurrent || isPopular;
          const isProcessingThisPlan = isUpdating === plan.id;

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
                {plan.id === 'nonstop' ? (
                    <Button 
                        disabled
                        className={cn("w-full", isFeatured ? "bg-primary-foreground text-primary" : "bg-primary/20 text-primary")}
                    >
                        {plan.cta}
                    </Button>
                 ) : isProcessingThisPlan && checkoutUrl ? (
                  <Button asChild className={cn("w-full", isFeatured ? "bg-primary-foreground text-primary hover:bg-white/90" : "")}>
                    <a href={checkoutUrl}>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Finalizează Plata
                    </a>
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handlePurchase(plan)}
                    disabled={isProcessingThisPlan || isWaitingForWebhook}
                    className={cn("w-full", isFeatured ? "bg-primary-foreground text-primary hover:bg-white/90" : "bg-primary/20 text-primary hover:bg-primary/30")}
                  >
                    {isProcessingThisPlan 
                      ? 'Se procesează...' 
                      : isCurrent 
                        ? 'Reînnoiește' 
                        : plan.cta}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
