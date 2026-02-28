'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trainers, subscriptions } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic imports with SSR disabled for heavy/client-dependent sections
const Header = dynamic(() => import('@/components/layout/header'), { 
  ssr: false,
  loading: () => <div className="h-16 w-full bg-background/80 border-b border-border/50 fixed top-0 z-50" />
});

const TransformationsSection = dynamic(
  () => import('@/components/transformations-section'),
  {
    ssr: false,
    loading: () => (
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="space-y-3 text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    ),
  }
);

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState('2024');

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[90vh] flex items-center justify-center">
            <Image
                src="https://i.imgur.com/6N8o2LA.jpg"
                alt="Modern gym with equipment"
                fill
                priority
                className="object-cover z-0 blur-sm"
                sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/70 z-10" />
            <div className="container relative z-20 px-4 md:px-6 text-center">
                <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-gradient uppercase font-headline">
                    Transformă-ți Corpul
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-medium italic">
                    Eliberează-ți potențialul la Techno Gym Craiova. 24/7 non-stop pentru succesul tău.
                </p>
                <div className="flex flex-col items-center gap-6">
                    <Button asChild size="lg" className="glow-primary h-14 px-8 text-lg font-bold rounded-2xl uppercase tracking-widest">
                        <Link href="/login">Alătură-te Acum</Link>
                    </Button>
                    
                    <div className="inline-flex items-center gap-4 rounded-2xl p-4 glass shadow-2xl">
                        <Clock className="w-10 h-10 text-primary" />
                        <div className="text-left">
                            <p className="text-3xl font-headline leading-none">24/7</p>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Deschis Non-Stop</p>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </section>

        {/* Transformations Section */}
        <TransformationsSection />

        {/* Trainers Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl uppercase font-headline">Cunoaște-ne Antrenorii</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl italic">
                Experții noștri certificați sunt dedicați să te ajute să îți atingi obiectivele.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              {trainers.map((trainer) => (
                <a href={trainer.instagramUrl} target="_blank" rel="noopener noreferrer" key={trainer.id} className="group">
                    <Card className="overflow-hidden relative aspect-square border-0 rounded-3xl transition-all duration-500 hover:scale-[1.02] shadow-xl">
                        <Image
                            src={trainer.image.imageUrl}
                            alt={trainer.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-2xl font-headline text-white tracking-wide">{trainer.name}</h3>
                            <p className="text-primary font-bold text-[10px] uppercase tracking-widest">{trainer.specialty}</p>
                        </div>
                    </Card>
                </a>
              ))}
            </div>
          </div>
        </section>
        
        {/* Subscriptions Preview */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card/30">
            <div className="container px-4 md:px-6">
                <div className="text-center space-y-3 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl uppercase font-headline">Abonamente</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl italic">
                        Alege pachetul care se potrivește programului tău.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {subscriptions.map((plan) => {
                      const isPopular = (plan as any).popular;
                      return (
                        <div
                            key={plan.id}
                            className={cn(
                                "relative flex h-full flex-col rounded-3xl p-6 transition-all duration-300",
                                isPopular ? "bg-gradient-primary text-primary-foreground glow-primary scale-[1.02] z-10" : "glass hover:border-primary/30"
                            )}
                        >
                            {isPopular && (
                              <Badge variant="secondary" className="absolute top-4 right-4 flex items-center gap-1 shadow-lg">
                                <Star className="w-3 h-3 fill-current"/> Popular
                              </Badge>
                            )}
                            
                            <div className="flex-grow pt-4">
                                <h3 className="text-2xl font-headline tracking-widest uppercase mb-2">{plan.title}</h3>
                                <p className={cn("text-xs mb-6", isPopular ? "text-primary-foreground/80" : "text-muted-foreground italic")}>
                                  {plan.description}
                                </p>
                                
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className={cn("text-5xl font-bold", isPopular ? "text-white" : "text-gradient")}>
                                      {plan.price.split(' ')[0]}
                                    </span>
                                    <span className={cn("text-sm font-medium opacity-70", isPopular ? "text-primary-foreground" : "text-muted-foreground")}>
                                      {plan.price.split(' ')[1]}{plan.period}
                                    </span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", isPopular ? "bg-white/20" : "bg-primary/20")}>
                                          <Check className={cn("w-3 h-3", isPopular ? "text-primary-foreground" : "text-primary")} />
                                        </div>
                                        <span className="text-sm font-medium">{benefit}</span>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="pt-4 mt-auto">
                                <Button asChild className={cn("w-full h-12 rounded-xl font-bold uppercase tracking-widest transition-all", isPopular ? "bg-white text-primary hover:bg-white/90" : "bg-primary/20 text-primary hover:bg-primary/30")} variant="default">
                                   <Link href="/login">{plan.cta}</Link>
                                </Button>
                            </div>
                        </div>
                      );
                    })}
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-background border-t border-border/50">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Link href="/" className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <Image src="https://i.imgur.com/9W1ye1w.png" alt="Logo" fill className="object-contain" />
                </div>
                <span className="text-lg font-bold tracking-tight uppercase font-headline">
                  <span className="text-primary">TECHNO</span>
                  <span className="text-foreground">GYM</span>
                </span>
            </Link>
            <p className="text-sm text-muted-foreground italic" suppressHydrationWarning>
              © {currentYear} Techno Gym Craiova. Dezvoltat pentru performanță.
            </p>
          </div>
          <div className="flex items-center gap-6">
             <Link href="/login" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Acces Membri</Link>
             <a href="https://instagram.com" target="_blank" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
