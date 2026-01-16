import { Dumbbell } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-b border-border/50 z-50 flex items-center">
      <div className="container mx-auto px-4 w-full">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="text-primary w-8 h-8" />
          <h1 className="text-2xl font-bold text-primary tracking-tighter">
            Techno Gym
          </h1>
        </Link>
      </div>
    </header>
  );
}
