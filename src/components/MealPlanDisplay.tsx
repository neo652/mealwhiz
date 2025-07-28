'use client';

import type { MealPlan, MealType } from '@/lib/types';
import { MealDayCard } from './MealDayCard';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface MealPlanDisplayProps {
  plan: MealPlan;
  onUpdateMeal: (dayIndex: number, mealType: MealType) => void;
  updatingMeal: { dayIndex: number; mealType: MealType } | null;
  loading: boolean;
}

const LoadingSkeleton = () => (
  <Card>
    <div className="p-6">
      <Skeleton className="h-7 w-1/4 mb-6" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  </Card>
);

export function MealPlanDisplay({
  plan,
  onUpdateMeal,
  updatingMeal,
  loading,
}: MealPlanDisplayProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (plan.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary rounded-lg">
        <p className="text-muted-foreground">
          Click &quot;Suggest New Plan&quot; to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {plan.map((dailyPlan, index) => (
        <MealDayCard
          key={`day-${index}`}
          dayNumber={index + 1}
          plan={dailyPlan}
          onUpdateMeal={onUpdateMeal}
          updatingMeal={updatingMeal}
        />
      ))}
    </div>
  );
}
