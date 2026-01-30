"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface StarRatingProps {
  totalStars?: number;
  rating?: number;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({ totalStars = 5, rating = 0, onRatingChange = () => {} }: StarRatingProps) {
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
                onClick={() => onRatingChange(starValue)}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(0)}
            >
                <Star className="w-10 h-10 fill-current" />
                <span className="sr-only">{starValue} Stars</span>
            </button>
            );
        })}
        </div>
        {rating > 0 && <Button variant="outline" onClick={() => onRatingChange(0)}>Resetează Rating</Button>}
    </div>
  );
}
