import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trainers } from "@/lib/data";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { subscriptions } from "@/lib/data";
import { cn } from "@/lib/utils";

const getImage = (id: string) => PlaceHolderImages.find(p => p.id === id);

export default function LandingPage() {
    const transformationBefore1 = getImage('transformation-before-1');
    const transformationAfter1 = getImage('transformation-after-1');

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
                <Link href="/register">Alătură-te Acum</Link>
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
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {trainers.map((trainer) => (
                <Card key={trainer.id} className="overflow-hidden text-center">
                    <CardHeader className="items-center p-6">
                        <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={trainer.image.imageUrl} alt={trainer.name} data-ai-hint={trainer.image.imageHint} />
                            <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
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
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Transformări Reale</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Inspiră-te din poveștile de succes ale membrilor noștri.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">Înainte & După</h3>
                        <div className="grid grid-cols-2 gap-2">
                           {transformationBefore1 && <Image src={transformationBefore1.imageUrl} alt="Before" width={300} height={400} data-ai-hint={transformationBefore1.imageHint} className="rounded-lg object-cover" />}
                           {transformationAfter1 && <Image src={transformationAfter1.imageUrl} alt="After" width={300} height={400} data-ai-hint={transformationAfter1.imageHint} className="rounded-lg object-cover" />}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">Rezultate Vizibile</h3>
                         <div className="grid grid-cols-2 gap-2">
                           {getImage('transformation-before-2') && <Image src={getImage('transformation-before-2').imageUrl} alt="Before" width={300} height={400} data-ai-hint={getImage('transformation-before-2').imageHint} className="rounded-lg object-cover" />}
                           {getImage('transformation-after-2') && <Image src={getImage('transformation-after-2').imageUrl} alt="After" width={300} height={400} data-ai-hint={getImage('transformation-after-2').imageHint} className="rounded-lg object-cover" />}
                        </div>
                    </div>
                </div>
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
            <Link href="/" className="flex items-center gap-3">
                <Image src="https://i.imgur.com/QdArxUJ.png" alt="Techno Gym Logo" width={24} height={24} className="object-contain" />
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
