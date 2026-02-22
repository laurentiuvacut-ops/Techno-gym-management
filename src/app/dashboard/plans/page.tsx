
'use client';
import { subscriptions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowLeft, LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { doc, updateDoc } from "firebase/firestore";
import { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/ai/flows/create-checkout-session";
import { addDays, format, isValid, differenceInCalendarDays } from 'date-fns';

function PlansComponent() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const paymentProcessedRef = useRef(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(true);

  const memberDocRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return doc(firestore, 'members', user.phoneNumber);
  }, [firestore, user]);

  const { data: memberData, isLoading: memberLoading } = useDoc(memberDocRef);

  const currentSubscription = useMemo(() => {
    if (!memberData || !memberData.subscriptionType) return null;
    return subscriptions.find(sub => sub.title === memberData.subscriptionType);
  }, [memberData]);

  useEffect(() => {
    const planId = searchParams.get('plan_id');
    const paymentSuccess = searchParams.get('payment_success') === 'true';

    if (paymentSuccess && planId) {
      sessionStorage.setItem('payment_processing_plan_id', planId);
      router.replace('/dashboard/plans', { scroll: false });
      return; 
    }

    const pendingPlanId = sessionStorage.getItem('payment_processing_plan_id');

    if (!pendingPlanId) {
      setIsProcessingPayment(false);
      return;
    }
    
    if (isUserLoading || memberLoading || !memberData || !memberDocRef) {
      return; 
    }
    
    if (paymentProcessedRef.current) {
      setIsProcessingPayment(false);
      return;
    }

    paymentProcessedRef.current = true;
    
    const processPaymentUpdate = async () => {
      const purchasedPlan = subscriptions.find(s => s.id === pendingPlanId);

      if (!purchasedPlan) {
        toast({
          variant: "destructive",
          title: "Eroare la procesare",
          description: "Planul achiziționat nu a fost găsit.",
        });
        sessionStorage.removeItem('payment_processing_plan_id');
        setIsProcessingPayment(false);
        return;
      }

      const daysToAdd = purchasedPlan.durationDays || 30;
      let startDate = new Date();
      const expirationValue = memberData.expirationDate;
      let currentExpirationDate;

      if (expirationValue) {
        if (typeof expirationValue === 'object' && expirationValue !== null && typeof (expirationValue as any).toDate === 'function') {
          currentExpirationDate = (expirationValue as any).toDate();
        } else if (typeof expirationValue === 'string') {
          const parts = expirationValue.split('-').map(part => parseInt(part, 10));
          if (parts.length === 3 && !parts.some(isNaN)) {
            currentExpirationDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
          }
        }
      }

      const today = new Date();
      const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

      if (currentExpirationDate && isValid(currentExpirationDate) && differenceInCalendarDays(currentExpirationDate, todayUtc) >= 0) {
        startDate = currentExpirationDate;
      }

      const newExpirationDate = addDays(startDate, daysToAdd);
      const updatedData = {
        expirationDate: format(newExpirationDate, 'yyyy-MM-dd'),
        subscriptionType: purchasedPlan.title,
        status: "Activ",
      };

      try {
        await updateDoc(memberDocRef, updatedData);
        toast({
          title: "Plată reușită!",
          description: `Abonamentul tău ${purchasedPlan.title} a fost activat.`,
          className: "bg-success text-success-foreground",
        });
      } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: memberDocRef.path,
            operation: 'update',
            requestResourceData: updatedData
        });
        errorEmitter.emit('permission-error', permissionError);
      } finally {
        sessionStorage.removeItem('payment_processing_plan_id');
        setIsProcessingPayment(false);
      }
    };
    
    processPaymentUpdate();
  }, [searchParams, user, isUserLoading, memberLoading, memberData, memberDocRef, firestore, toast, router]);


  useEffect(() => {
    if (!isUserLoading && !user && mounted) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, mounted]);

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
  
  const loading = isUserLoading || memberLoading || isProcessingPayment || !mounted;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Se procesează...</p>
      </div>
    );
  }

  if (!user) return null;
  
  const currentPlanId = currentSubscription?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <Button asChild variant="outline" className="w-fit">
          <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la Panou
          </Link>
      </Button>

      <div className="space-y-1 text-center">
        <h1 className="text-4xl font-headline tracking-wider">Abonamente</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Alege planul care ți se potrivește.</p>
      </div>

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
                    disabled={isProcessingThisPlan}
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

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>}>
      <PlansComponent />
    </Suspense>
  )
}
