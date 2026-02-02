'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trainers, transformations } from "@/lib/data";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { subscriptions } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const getImage = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) {
        // Return a default placeholder if the image is not found
        return {
            id: 'not-found',
            description: 'Placeholder image',
            imageUrl: 'https://picsum.photos/seed/placeholder/600/400',
            imageHint: 'placeholder',
        };
    }
    return img;
};


export default function LandingPage() {

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-background to-card/50">
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl lg:text-7xl">
                TRANSFORMĂ-ȚI CORPUL
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Eliberează-ți potențialul la Techno Gym. Antrenori de top, vibe-ul potrivit și o comunitate care te susține.
              </p>
              <Button asChild size="lg">
                <Link href="/login">Alătură-te Acum</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trainers Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Cunoaște-ne Antrenorii</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Experții noștri certificați sunt dedicați să te ajute să îți atingi obiectivele.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-4 lg:gap-8">
              {trainers.map((trainer) => (
                <Card key={trainer.id} className="overflow-hidden text-center">
                    <CardHeader className="items-center p-6">
                        <div className="relative w-24 h-24">
                          <Avatar className="w-24 h-24 border-4 border-primary">
                              <AvatarImage src={trainer.image.imageUrl} alt={trainer.name} data-ai-hint={trainer.image.imageHint} style={{objectFit: 'cover'}} />
                              <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <CardTitle>{trainer.name}</CardTitle>
                        <Badge variant="secondary">{trainer.specialty}</Badge>
                    </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Transformations Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="space-y-3 text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Transformări Reale</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                        Inspiră-te din poveștile de succes ale membrilor noștri.
                    </p>
                </div>
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full max-w-4xl mx-auto mt-12"
                >
                  <CarouselContent>
                    {transformations.map((transform) => (
                      <CarouselItem key={transform.id} className="md:basis-1/2">
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex flex-col items-center justify-center p-4 gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 text-center">
                                        <Image 
                                            src={transform.before.imageUrl} 
                                            alt="Before" 
                                            width={300} 
                                            height={400} 
                                            data-ai-hint={transform.before.imageHint} 
                                            className="rounded-lg object-cover aspect-[3/4]" 
                                        />
                                        <Badge variant="outline">Înainte</Badge>
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <Image 
                                            src={transform.after.imageUrl} 
                                            alt="After" 
                                            width={300} 
                                            height={400} 
                                            data-ai-hint={transform.after.imageHint} 
                                            className="rounded-lg object-cover aspect-[3/4]" 
                                        />
                                        <Badge variant="default">După</Badge>
                                    </div>
                                </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
            </div>
        </section>
        
        {/* Subscriptions Preview */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card/50">
            <div className="container px-4 md:px-6">
                <div className="text-center space-y-3 mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Alege Abonamentul Potrivit</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                        Flexibilitate maximă pentru a se potrivi stilului tău de viață.
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {subscriptions.map((plan) => (
                    <Card
                        key={plan.id}
                        className={cn("flex flex-col", plan.popular ? "border-primary shadow-lg" : "")}
                    >
                        {plan.popular && <Badge className="absolute -top-3 right-4">Popular</Badge>}
                        <CardHeader>
                            <CardTitle>{plan.title}</CardTitle>
                            <p>
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.period}</span>
                            </p>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-3">
                                {plan.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary" />
                                    <span>{benefit}</span>
                                </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    ))}
                </div>
                 <div className="text-center mt-12">
                    <Button asChild size="lg">
                        <Link href="/subscriptions">Vezi Toate Planurile</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-4 md:px-0">
            <Link href="/" className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <Image 
                    src="https://i.imgur.com/gd54yJq.png" 
                    alt="Techno Gym Logo" 
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-bold tracking-tight"><span className="text-primary">TECHNO</span><span className="text-foreground">GYM</span></span>
            </Link>
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Techno Gym. Toate drepturile rezervate.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
