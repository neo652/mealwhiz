
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import type { DailyPlan, MealType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MealDayCardProps {
  date: Date;
  dayIndex: number;
  plan: DailyPlan;
  onUpdateMeal: (dayIndex: number, mealType: MealType) => void;
  updatingMeal: { dayIndex: number; mealType: MealType } | null;
  isToday: boolean;
}

export function MealDayCard({
  date,
  dayIndex,
  plan,
  onUpdateMeal,
  updatingMeal,
  isToday,
}: MealDayCardProps) {

  const renderMealRow = (mealType: MealType) => {
    const isUpdating =
      updatingMeal?.dayIndex === dayIndex && updatingMeal?.mealType === mealType;

    return (
      <div
        key={mealType}
        className="flex items-center justify-between gap-4 py-3"
      >
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-muted-foreground">
            {mealType}
          </p>
          {isUpdating ? (
            <Skeleton className="h-5 w-32 md:w-48 mt-1" />
          ) : (
            <p className="text-foreground transition-all duration-300">
              {plan[mealType]}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onUpdateMeal(dayIndex, mealType)}
          disabled={!!updatingMeal}
          aria-label={`Suggest another ${mealType}`}
          className="text-muted-foreground hover:text-primary"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  return (
    <Card className={cn("flex flex-col transition-all duration-300 ease-in-out", isToday && "border-primary ring-2 ring-primary shadow-lg")}>
      <CardHeader>
        <CardTitle className="font-headline text-lg md:text-xl">
            <div>{format(date, 'EEEE')}</div>
            <div className="text-sm text-muted-foreground font-sans font-normal">{format(date, 'MMM d')}</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 divide-y">
        {renderMealRow('Breakfast')}
        {renderMealRow('Lunch')}
        {renderMealRow('Dinner')}
        {renderMealRow('Snack')}
      </CardContent>
    </Card>
  );
}
