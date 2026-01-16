import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { Icons } from "@/components/icons";
import DaysRemainingChart from "@/components/days-remaining-chart";
import WeeklyActivityChart from "@/components/weekly-activity-chart";
import Link from "next/link";

export default function Home() {
  const daysLeft = 22;
  const totalDays = 30;

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground">STATUS ABONAMENT</p>
              <p className="font-bold text-lg flex items-center gap-2">
                Activ <Check className="w-5 h-5 text-green-500" />
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Icons.qrCode className="w-8 h-8" />
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <DaysRemainingChart daysLeft={daysLeft} totalDays={totalDays} />
            <div className="flex-1">
              <p className="font-bold">Timp Rămas</p>
              <p className="text-sm text-muted-foreground">
                Abonamentul tău expiră în 3 săptămâni.
              </p>
            </div>
          </div>
          <Button size="lg" className="w-full mt-6 bg-primary/90 hover:bg-primary text-primary-foreground font-bold">
            SCANARE RAPIDĂ
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-4">ACTIVITATE SĂPTĂMÂNALĂ</p>
            <WeeklyActivityChart />
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <Link href="/workouts" className="flex items-center justify-between">
            <div>
              <p className="font-bold">Gata de antrenament?</p>
              <p className="text-sm text-muted-foreground">
                Începe să-ți notezi progresul astăzi.
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
