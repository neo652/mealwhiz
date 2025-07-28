'use client';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, Sparkles, UtensilsCrossed } from 'lucide-react';

interface HeaderProps {
  onNewPlanClick: () => void;
  loading: boolean;
}

export function Header({ onNewPlanClick, loading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <UtensilsCrossed className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">
          MealWhiz
        </h1>
      </div>
      <Button onClick={onNewPlanClick} disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Sparkles />
        )}
        <span>Suggest New Plan</span>
      </Button>
    </header>
  );
}
