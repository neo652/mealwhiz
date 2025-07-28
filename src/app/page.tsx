'use client';

import * as React from 'react';
import { suggestNewMealPlan } from '@/ai/flows/suggest-new-meal-plan';
import { updateSingleMeal } from '@/ai/flows/update-single-meal';
import type { MealItems, MealPlan, MealType } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { INITIAL_MEAL_ITEMS } from '@/lib/data';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/Header';
import { MealPlanDisplay } from '@/components/MealPlanDisplay';
import { MealManager } from '@/components/MealManager';
import { useToast } from '@/hooks/use-toast';
import Loading from './loading';

const MEAL_ITEMS_STORAGE_KEY = 'mealwhiz-items';
const MEAL_PLAN_STORAGE_KEY = 'mealwhiz-plan';

export default function MealWhizPage() {
  const { toast } = useToast();
  const [mealItems, setMealItems] = useLocalStorage<MealItems>(
    MEAL_ITEMS_STORAGE_KEY,
    INITIAL_MEAL_ITEMS
  );
  const [mealPlan, setMealPlan] = useLocalStorage<MealPlan>(
    MEAL_PLAN_STORAGE_KEY,
    []
  );

  const [isClient, setIsClient] = React.useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = React.useState(true);
  const [isUpdatingMeal, setIsUpdatingMeal] = React.useState<{
    dayIndex: number;
    mealType: MealType;
  } | null>(null);

  React.useEffect(() => {
    setIsClient(true);
    if (mealPlan.length === 0) {
      handleGenerateNewPlan(true);
    } else {
      setIsLoadingPlan(false);
    }
  }, []);

  const handleGenerateNewPlan = React.useCallback(async (isInitial = false) => {
    setIsLoadingPlan(true);
    try {
      const newPlan = await suggestNewMealPlan({
        breakfastItems: mealItems.Breakfast,
        lunchItems: mealItems.Lunch,
        dinnerItems: mealItems.Dinner,
        snackItems: mealItems.Snack,
        numberOfDays: 14,
      });
      setMealPlan(newPlan);
      if (!isInitial) {
        toast({
          title: 'New Meal Plan Generated!',
          description: 'Your two-week meal plan has been refreshed.',
        });
      }
    } catch (error) {
      console.error('Failed to generate new meal plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate a new meal plan. Please try again.',
      });
    } finally {
      setIsLoadingPlan(false);
    }
  }, [mealItems, setMealPlan, toast]);

  const handleUpdateSingleMeal = React.useCallback(
    async (dayIndex: number, mealType: MealType) => {
      setIsUpdatingMeal({ dayIndex, mealType });
      try {
        const availableMeals = mealItems[mealType];
        if (availableMeals.length < 2) {
          toast({
            variant: 'destructive',
            title: 'Not enough options',
            description: `Please add more ${mealType} items to get a new suggestion.`,
          });
          return;
        }

        const updatedPlan = await updateSingleMeal({
          mealPlan,
          dayIndex,
          mealType,
          availableMeals,
        });

        setMealPlan(updatedPlan);
        toast({
          title: `${mealType} Updated!`,
          description: `A new ${mealType.toLowerCase()} has been selected for Day ${dayIndex + 1}.`,
        });
      } catch (error) {
        console.error('Failed to update meal:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Could not suggest a new ${mealType.toLowerCase()}.`,
        });
      } finally {
        setIsUpdatingMeal(null);
      }
    },
    [mealItems, mealPlan, setMealPlan, toast]
  );

  const handleMealItemsChange = (newItems: MealItems) => {
    setMealItems(newItems);
    toast({
      title: 'Meal List Updated',
      description: 'Your changes have been saved.',
    });
  };
  
  if (!isClient) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <MealManager items={mealItems} onChange={handleMealItemsChange} />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header
            onNewPlanClick={() => handleGenerateNewPlan()}
            loading={isLoadingPlan}
          />
          <main className="flex-1 p-4 md:p-6">
            <MealPlanDisplay
              plan={mealPlan}
              onUpdateMeal={handleUpdateSingleMeal}
              updatingMeal={isUpdatingMeal}
              loading={isLoadingPlan}
            />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
