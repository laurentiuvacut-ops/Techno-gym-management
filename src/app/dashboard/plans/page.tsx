'use client';
import { subscriptions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useDoc } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { doc, updateDoc } from "firebase/firestore";
import { useMemo, useState, useEffect, Suspense } from 'react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/ai/flows/create-checkout-session";

function PlansComponent() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const memberDocRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'members', user.uid);
  }, [firestore, user]);

  const { data: memberData, isLoading: memberLoading } = useDoc(memberDocRef);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Handle successful payment redirect from Stripe
  useEffect(() => {
    const handleSuccessfulPayment = async () => {
        const planId = searchParams.get('plan_id');
        // Check if the URL contains the success parameter and plan_id from Stripe
        if (searchParams.get('payment_success') === 'true' && user && firestore && planId) {
            
            // NOTE: In a production app, you would verify the session_id with your backend.
            // For this prototype, we optimistically update the user's status.
            
            const purchasedPlan = subscriptions.find(s => s.id === planId);

            if (purchasedPlan) {
                const memberDocRef = doc(firestore, 'members', user.uid);
                
                // Add purchased days to existing days, or set them if expired
                const currentDaysRemaining = memberData?.daysRemaining || 0;
                const daysToAdd = (purchasedPlan as any).durationDays || 30;
                const newDaysRemaining = (currentDaysRemaining > 0 ? currentDaysRemaining : 0) + daysToAdd;

                await updateDoc(memberDocRef, {
                    subscriptionId: purchasedPlan.id,
                    status: "Active",
                    daysRemaining: newDaysRemaining,
                });

                toast({
                    title: "Plată reușită!",
                    description: `Abonamentul tău ${purchasedPlan.title} a fost activat.`,
                });
            }

            // Clean up the URL to prevent re-triggering this effect on refresh.
            router.replace('/dashboard/plans', { scroll: false });
        }
    };
    
    // Run this effect only when the user and member data are loaded to avoid race conditions.
    if(!userLoading && !memberLoading) {
      handleSuccessfulPayment();
    }

  }, [searchParams, user, firestore, router, toast, memberData, userLoading, memberLoading]);

  const handlePurchase = async (plan: any) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Trebuie să fii autentificat pentru a efectua o plată.",
      });
      return;
    }

    if (!plan.stripePriceId || plan.stripePriceId.includes('placeholder')) {
        toast({
            variant: "destructive",
            title: "Configurare incompletă",
            description: "Acest plan nu este configurat pentru plată. Vă rugăm să adăugați ID-ul prețului din Stripe.",
        });
        return;
    }

    setIsUpdating(plan.id);

    try {
        const baseUrl = window.location.origin;
        const { url, error: stripeError } = await createCheckoutSession({
            priceId: plan.stripePriceId,
            userId: user.uid,
            baseUrl: baseUrl,
            planId: plan.id, // Pass the plan id to the flow
        });

        if (url) {
            // Redirect the user to Stripe's checkout page.
            window.location.href = url;
        } else {
            let description = stripeError || "Nu s-a putut crea sesiunea de plată. Asigurați-vă că cheia Stripe este configurată corect în fișierul .env.local.";
            
            if (stripeError && stripeError.includes('No such price')) {
                description = `Eroare de la Stripe: "No such price: ${plan.stripePriceId}". Aceasta este o problemă de configurare. Cauze posibile:\n\n1. (Cel mai frecvent) Folosiți o cheie de API (sk_test_...) dintr-un mod (Test) și un ID de preț (price_...) din alt mod (Live). Cheile și ID-urile trebuie să fie din același mod.\n\n2. ID-ul de preț a fost copiat greșit sau este pentru un alt cont Stripe.\n\n3. Prețul nu este 'activ' în Stripe.\n\nVă rugăm să verificați că ID-urile din pagina de Debug se potrivesc cu cele din contul Stripe (modul Test).`;
            } else if (stripeError && stripeError.includes('recurring price in subscription mode')) {
                description = `Eroare de configurare a prețului în Stripe. Prețul cu ID-ul "${plan.stripePriceId}" nu este configurat ca unul recurent (subscription).\n\n**Soluție:**\n1. În contul Stripe, mergeți la produsul corespunzător.\n2. Asigurați-vă că modelul de preț (Pricing model) este setat pe **"Recurring"** (Recurent).\n3. Dacă ați creat prețul ca "One-time" (O singură plată), va trebui să îl arhivați și să creați unul nou, de tip "Recurring", pentru același produs. Apoi copiați noul ID de preț în fișierul \`src/lib/data.ts\`.`;
            }

            toast({
              variant: "destructive",
              title: "Eroare la procesarea plății",
              description: description,
              duration: 20000,
            });
            setIsUpdating(null);
        }
    } catch (error) {
      console.error("Error creating Stripe checkout session:", error);
      toast({
        variant: "destructive",
        title: "Eroare la procesarea plății",
        description: "A apărut o problemă la comunicarea cu serverul. Vă rugăm să încercați din nou.",
      });
       setIsUpdating(null);
    }
  };

  const loading = userLoading || memberLoading;

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentPlanId = memberData?.subscriptionId;

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
        <p className="text-muted-foreground max-w-2xl mx-auto">Alege planul care ți se potrivește. Poți anula sau schimba oricând.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptions.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPopular = plan.popular;
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
                <Button 
                  onClick={() => handlePurchase(plan)}
                  disabled={isUpdating === plan.id}
                  className={cn("w-full", isFeatured ? "bg-primary-foreground text-primary hover:bg-white/90" : "bg-primary/20 text-primary hover:bg-primary/30")}
                >
                  {isUpdating === plan.id 
                    ? 'Se procesează...' 
                    : isCurrent 
                      ? 'Reînnoiește' 
                      : plan.cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}


// A `Suspense` boundary is required to use `useSearchParams()` in a page that may be server-rendered.
export default function PlansPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>}>
      <PlansComponent />
    </Suspense>
  )
}
