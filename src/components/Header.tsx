'use client';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, LogOut, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';

interface HeaderProps {
  onNewPlanClick: () => void;
  loading: boolean;
}

export function Header({ onNewPlanClick, loading }: HeaderProps) {
  const { user } = useAuth();
  
  const handleSignOut = async () => {
    await auth.signOut();
    // This will trigger the auth state listener to sign in a new anonymous user
    window.location.reload(); // Reload to clear all state
  };
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <UtensilsCrossed className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">
          MealWhiz
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onNewPlanClick} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          <span>New Plan</span>
        </Button>
        {user && (
          <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
            <LogOut />
          </Button>
        )}
      </div>
    </header>
  );
}
