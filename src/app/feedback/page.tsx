"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/star-rating";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FeedbackPage() {
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

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Feedback & Community
        </h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
          Your feedback helps us improve. Share your thoughts and rate your experience.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Rate Your Last Workout</CardTitle>
          <CardDescription>How was your last session at Techno Gym?</CardDescription>
        </CardHeader>
        <CardContent>
            <StarRating />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit a Suggestion</CardTitle>
          <CardDescription>Have an idea to make the gym better? Let us know!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="e.g., New equipment request" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="suggestion">Suggestion</Label>
            <Textarea id="suggestion" placeholder="Tell us more..." rows={5} />
          </div>
          <Button className="w-full">Submit Feedback</Button>
        </CardContent>
      </Card>
    </div>
  );
}
