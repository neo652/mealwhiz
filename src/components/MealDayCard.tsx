
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Meal, MealItems, MealType, DailyPlan } from '@/lib/types';
import { MealSelector } from './MealSelector';
import { Loader2, RefreshCw } from 'lucide-react';


interface MealDayCardProps {
  date: Date;
  dayIndex: number;
  plan: DailyPlan;
  availableMeals: MealItems;
  onUpdateMeal: (dayIndex: number, mealType: MealType, newMeal: Meal) => void;
  onRefreshMeal: (dayIndex: number, mealType: MealType) => void;
  isUpdatingMeal: string | null;
  isToday: boolean;
}

export function MealDayCard({
  date,
  dayIndex,
  plan,
  onUpdateMeal,
  onRefreshMeal,
  isUpdatingMeal,
  availableMeals,
  isToday,
}: MealDayCardProps) {
  
  const renderMealRow = (mealType: MealType) => {
    const updateKey = `${dayIndex}-${mealType}`;
    const isCurrentlyUpdating = isUpdatingMeal === updateKey;

    return (
      <div
        key={mealType}
        className="flex items-center justify-between gap-2 py-2"
      >
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-sm font-semibold text-muted-foreground">
            {mealType}
          </p>
          <p className="text-foreground transition-all duration-300 truncate">
            {plan[mealType]}
          </p>
        </div>
        <div className="flex items-center gap-1">
           <Button
              variant="ghost"
              size="icon"
              disabled={isCurrentlyUpdating}
              onClick={() => onRefreshMeal(dayIndex, mealType)}
              aria-label={`Get new suggestion for ${mealType}`}
              className="text-muted-foreground hover:text-primary"
            >
              {isCurrentlyUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <MealSelector 
              mealType={mealType}
              availableMeals={availableMeals[mealType]}
              currentMeal={plan[mealType]}
              onMealSelect={(newMeal) => onUpdateMeal(dayIndex, mealType, newMeal)}
            />
        </div>
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
