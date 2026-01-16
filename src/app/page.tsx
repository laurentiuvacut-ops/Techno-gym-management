import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "lucide-react";
import { Icons } from "@/components/icons";
import DaysRemainingChart from "@/components/days-remaining-chart";

export default function Home() {
  const daysLeft = 23;
  const totalDays = 30;

  return (
    <div className="space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Membership Status</span>
            <Badge variant="success">Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="p-4 bg-white rounded-lg shadow-inner">
            <Icons.qrCode className="w-48 h-48" />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Show this QR code at the entrance for a seamless check-in.
          </p>
          <Button size="lg" className="w-full text-lg font-bold">
            <QrCode className="mr-2" />
            Quick Scan
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <DaysRemainingChart daysLeft={daysLeft} totalDays={totalDays} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
