'use client';

import { subscriptions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SubscriptionsPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const plansToShow = subscriptions.filter(plan => ["classic", "pro", "student"].includes(plan.id));

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Abonamente
        </h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
          Alege planul care ți se potrivește. Poți anula sau schimba oricând.
        </p>
      </div>

      <div className="grid max-w-2xl grid-cols-1 gap-8 mx-auto">
        {plansToShow.map((plan) => {
          const isFeatured = plan.popular;
          return (
            <div key={plan.id} className={cn("relative", isFeatured && "z-10")}>
              {isFeatured && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 transform">
                  <Badge className="bg-secondary text-secondary-foreground border-none">
                    <Star className="mr-2 h-4 w-4" />
                    Popular
                  </Badge>
                </div>
              )}
              <Card
                className={cn(
                  "flex h-full flex-col rounded-3xl glass"
                )}
              >
                <CardHeader className="items-center p-8">
                  <CardTitle className="text-2xl">{plan.title}</CardTitle>
                  <div className="text-center pt-4">
                    <span className="text-5xl font-bold text-primary">
                      {plan.price.split(' ')[0]}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      {plan.price.split(' ')[1]}{plan.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-8 pt-0">
                  <ul className="space-y-4">
                    {plan.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check
                          className="mt-1 h-5 w-5 shrink-0 text-primary"
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button
                    className="w-full"
                    size="lg"
                    variant={isFeatured ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
