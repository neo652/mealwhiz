import { UtensilsCrossed } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <UtensilsCrossed className="h-12 w-12 animate-pulse text-primary" />
        <p className="text-lg font-semibold text-primary-foreground font-headline">
          MealWhiz is preparing your plan...
        </p>
      </div>
    </div>
  );
}
