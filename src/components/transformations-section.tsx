
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { transformations } from "@/lib/data";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function TransformationsSection() {
    return (
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
                  className="w-full max-w-5xl mx-auto mt-12"
                >
                  <CarouselContent>
                    {transformations.map((transform) => (
                      <CarouselItem key={transform.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-4">
                          <div className="grid grid-cols-2 overflow-hidden rounded-lg shadow-lg">
                            <div className="relative aspect-[3/4]">
                              <Image
                                src={transform.before.imageUrl}
                                alt="Before"
                                fill
                                data-ai-hint={transform.before.imageHint}
                                className="object-cover"
                              />
                              <Badge className="absolute bottom-2 left-2 border-none bg-black/50 text-white">Înainte</Badge>
                            </div>
                            <div className="relative aspect-[3/4]">
                              <Image
                                src={transform.after.imageUrl}
                                alt="After"
                                fill
                                data-ai-hint={transform.after.imageHint}
                                className="object-cover"
                              />
                              <Badge className="absolute bottom-2 left-2 border-none bg-black/50 text-white">După</Badge>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:inline-flex" />
                  <CarouselNext className="hidden md:inline-flex" />
                </Carousel>
                <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground md:hidden">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm font-light">Glisează</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
            </div>
        </section>
    )
}
