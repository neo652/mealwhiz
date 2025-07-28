
'use client';

import type { MealPlan, MealType } from '@/lib/types';
import { MealDayCard } from './MealDayCard';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addDays, format, isWithinInterval } from 'date-fns';
import { useMemo } from 'react';

interface MealPlanDisplayProps {
  plan: MealPlan;
  startDate: Date;
  todayIndex: number;
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
  startDate,
  todayIndex,
  onUpdateMeal,
  updatingMeal,
  loading,
}: MealPlanDisplayProps) {

  const defaultTab = useMemo(() => {
    if (todayIndex >= 0 && todayIndex < 7) return 'week1';
    if (todayIndex >= 7 && todayIndex < 14) return 'week2';
    return 'week1';
  }, [todayIndex]);


  const renderWeek = (weekNumber: number) => {
    const startIndex = (weekNumber - 1) * 7;
    const endIndex = weekNumber * 7;
    const weekDays = plan.slice(startIndex, endIndex);

    if (loading) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <LoadingSkeleton key={`skel-w${weekNumber}-${i}`} />
            ))}
          </div>
        );
      }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-6">
        {weekDays.map((dailyPlan, index) => {
          const dayIndex = startIndex + index;
          const date = addDays(startDate, dayIndex);
          return (
            <MealDayCard
              key={`day-${dayIndex}`}
              date={date}
              plan={dailyPlan}
              onUpdateMeal={onUpdateMeal}
              updatingMeal={updatingMeal}
              isToday={dayIndex === todayIndex}
              dayIndex={dayIndex}
            />
          );
        })}
      </div>
    );
  };

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
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="week1">Week 1</TabsTrigger>
        <TabsTrigger value="week2">Week 2</TabsTrigger>
      </TabsList>
      <TabsContent value="week1" className="mt-4">
        {renderWeek(1)}
      </TabsContent>
      <TabsContent value="week2" className="mt-4">
        {renderWeek(2)}
      </TabsContent>
    </Tabs>
  );
}
