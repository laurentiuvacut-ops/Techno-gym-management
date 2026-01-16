"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export default function StarRating({ totalStars = 5 }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4">
        <div className="flex items-center space-x-1">
        {[...Array(totalStars)].map((_, index) => {
            const starValue = index + 1;
            return (
            <button
                type="button"
                key={starValue}
                className={cn(
                    "transition-colors",
                    starValue <= (hover || rating) ? "text-primary" : "text-muted-foreground/50"
                )}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(0)}
            >
                <Star className="w-10 h-10 fill-current" />
                <span className="sr-only">{starValue} Stars</span>
            </button>
            );
        })}
        </div>
        {rating > 0 && <Button variant="outline" onClick={() => {setRating(0); setHover(0);}}>Reset Rating</Button>}
    </div>
  );
}
