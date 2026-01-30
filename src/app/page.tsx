import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { Icons } from "@/components/icons";
import DaysRemainingChart from "@/components/days-remaining-chart";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const daysLeft = 22;
  const totalDays = 30;

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-8">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">STATUS ABONAMENT</p>
                <p className="font-bold text-xl flex items-center gap-2">
                  Activ <Check className="w-5 h-5 text-green-500" />
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                    <Icons.qrCode className="w-8 h-8" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card/90 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Scanează la intrare</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-center p-8">
                      <Icons.qrCode className="w-48 h-48 text-white" />
                  </div>
                  <p className="text-center text-muted-foreground text-sm">
                      Prezintă acest cod la recepție pentru a intra în sală.
                  </p>
                </DialogContent>
              </Dialog>
          </div>
          
          <div className="flex flex-col items-center text-center gap-2">
            <DaysRemainingChart daysLeft={daysLeft} totalDays={totalDays} />
            <p className="text-2xl font-bold mt-4">Abonamentul expiră în</p>
            <p className="text-lg text-muted-foreground">3 săptămâni</p>
          </div>

        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <Link href="/subscriptions" className="flex items-center justify-between">
            <div>
              <p className="font-bold">Reînnoiește abonamentul</p>
              <p className="text-sm text-muted-foreground">
                Nu lăsa să expire. Alege un plan nou astăzi!
              </p>
            </div>
            <div className="bg-white/10 p-2 rounded-full">
                <ChevronRight className="text-white" />
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
