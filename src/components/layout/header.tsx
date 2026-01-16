import { Dumbbell, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm z-50 flex items-center">
      <div className="container mx-auto px-4 w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="text-primary w-8 h-8" />
          <h1 className="text-xl font-bold text-white tracking-tighter">
            TECHNO<span className="font-light">GYM</span>
          </h1>
        </Link>
        <Button variant="ghost" size="icon">
            <User className="text-white/80" />
        </Button>
      </div>
    </header>
  );
}
