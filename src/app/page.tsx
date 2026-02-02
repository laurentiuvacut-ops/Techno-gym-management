'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trainers, transformations } from "@/lib/data";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from "next/image";
import Link from "next/link";
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
        <section className="relative w-full h-[90vh] flex items-center justify-center">
            <Image
                src={getImage('gym-interior-1').imageUrl}
                alt="Modern gym with equipment"
                data-ai-hint={getImage('gym-interior-1').imageHint}
                fill
                className="object-cover z-0"
            />
            <div className="absolute inset-0 bg-black/70 z-10" />
            <div className="container relative z-20 px-4 md:px-6 text-center">
                <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-gradient">
                    TRANSFORMĂ-ȚI CORPUL
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    Eliberează-ți potențialul la Techno Gym. Antrenori de top, vibe-ul potrivit și o comunitate care te susține.
                </p>
                <Button asChild size="lg" className="glow-primary">
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
                <Card key={trainer.id} className="overflow-hidden group relative aspect-[3/4] border-0">
                    <Image
                        src={trainer.image.imageUrl}
                        alt={trainer.name}
                        data-ai-hint={trainer.image.imageHint}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                        <h3 className="text-2xl font-bold text-white">{trainer.name}</h3>
                        <p className="text-primary font-semibold">{trainer.specialty}</p>
                    </div>
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
                          <Card className="glass">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Image 
                                            src={transform.before.imageUrl} 
                                            alt="Before" 
                                            width={300} 
                                            height={400} 
                                            data-ai-hint={transform.before.imageHint} 
                                            className="rounded-lg object-cover aspect-[3/4] w-full h-full" 
                                        />
                                        <Badge className="absolute bottom-4 left-4 bg-black/50 text-white border-none">Înainte</Badge>
                                    </div>
                                    <div className="relative">
                                        <Image 
                                            src={transform.after.imageUrl} 
                                            alt="After" 
                                            width={300} 
                                            height={400} 
                                            data-ai-hint={transform.after.imageHint} 
                                            className="rounded-lg object-cover aspect-[3/4] w-full h-full" 
                                        />
                                        <Badge className="absolute bottom-4 left-4 bg-black/50 text-white border-none">După</Badge>
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
                        className={cn(
                            "flex flex-col glass", 
                            plan.popular ? "border-primary glow-primary" : ""
                        )}
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
                    src="https://i.imgur.com/9W1ye1w.png" 
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
