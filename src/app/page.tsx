
'use client';

import * as React from 'react';
import { suggestNewMealPlan } from '@/ai/flows/suggest-new-meal-plan';
import { updateSingleMeal } from '@/ai/flows/update-single-meal';
import type { DailyPlan, MealItems, MealPlan, MealType } from '@/lib/types';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/Header';
import { MealPlanDisplay } from '@/components/MealPlanDisplay';
import { MealManager } from '@/components/MealManager';
import { useToast } from '@/hooks/use-toast';
import Loading from './loading';
import { getMealItems, saveMealItems } from '@/services/meal-items';
import { getLatestMealPlan, saveMealPlan } from '@/services/meal-plan';
import { differenceInDays, startOfToday } from 'date-fns';

export default function MealWhizPage() {
  const { toast } = useToast();
  const [mealItems, setMealItems] = React.useState<MealItems | null>(null);
  const [mealPlan, setMealPlan] = React.useState<MealPlan | null>(null);
  const [planStartDate, setPlanStartDate] = React.useState<string | null>(
    null
  );

  const [isClient, setIsClient] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = React.useState(false);
  const [isUpdatingMeal, setIsUpdatingMeal] = React.useState<{
    dayIndex: number;
    mealType: MealType;
  } | null>(null);

  const handleSavePlan = React.useCallback(async (plan: MealPlan, startDate: Date) => {
    try {
        await saveMealPlan({ plan, startDate: startDate.toISOString() });
    } catch (error) {
        console.error('Failed to save meal plan:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save your meal plan. Your changes might not be persisted.',
        });
    }
  }, [toast]);

  const handleGenerateNewPlan = React.useCallback(async (currentMealItems: MealItems, isInitial = false) => {
    setIsGeneratingPlan(true);
    try {
      const newStartDate = startOfToday();
      const newPlan = await suggestNewMealPlan({
        breakfastItems: currentMealItems.Breakfast,
        lunchItems: currentMealItems.Lunch,
        dinnerItems: currentMealItems.Dinner,
        snackItems: currentMealItems.Snack,
        numberOfDays: 14,
        startDate: newStartDate.toISOString(),
      });
      
      setMealPlan(newPlan);
      setPlanStartDate(newStartDate.toISOString());
      await handleSavePlan(newPlan, newStartDate);

      if (!isInitial) {
        toast({
          title: 'New Meal Plan Generated!',
          description: 'Your two-week meal plan has been refreshed and saved.',
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
      setIsGeneratingPlan(false);
    }
  }, [handleSavePlan, toast]);

  React.useEffect(() => {
    setIsClient(true);
    async function loadInitialData() {
      setIsLoading(true);
      const items = await getMealItems();
      setMealItems(items);
      
      const storedPlanData = await getLatestMealPlan();

      if (!storedPlanData || storedPlanData.plan.length < 14) {
        await handleGenerateNewPlan(items, true); 
      } else {
        setMealPlan(storedPlanData.plan);
        setPlanStartDate(storedPlanData.startDate);
      }
      
      setIsLoading(false);
    }
    loadInitialData();
  }, [handleGenerateNewPlan]);

  const handleUpdateSingleMeal = React.useCallback(
    async (dayIndex: number, mealType: MealType) => {
      if (!mealItems || !mealPlan || !planStartDate) return;
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
        const dailyPlanToSave = updatedPlan.find(p => p.date === mealPlan[dayIndex].date);

        if (dailyPlanToSave) {
             await saveMealPlan({ plan: [dailyPlanToSave], startDate: new Date(dailyPlanToSave.date).toISOString() });
        }
       

        toast({
          title: `${mealType} Updated!`,
          description: `A new ${mealType.toLowerCase()} has been selected.`,
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
    [mealItems, mealPlan, planStartDate, toast]
  );

  const handleMealItemsChange = async (newItems: MealItems) => {
    setMealItems(newItems);
    try {
      await saveMealItems(newItems);
      toast({
        title: 'Meal List Updated',
        description: 'Your changes have been saved to the cloud.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Save Error',
        description: 'Could not save your meal list. Please try again.',
      });
      const oldItems = await getMealItems();
      setMealItems(oldItems);
    }
  };
  
  if (!isClient || isLoading || !mealItems || !mealPlan) {
    return <Loading />;
  }

  const todayIndex = planStartDate
    ? differenceInDays(startOfToday(), new Date(planStartDate))
    : -1;

  return (
    <SidebarProvider>
      <MealManager items={mealItems} onChange={handleMealItemsChange} />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header
            onNewPlanClick={() => handleGenerateNewPlan(mealItems)}
            loading={isGeneratingPlan}
          />
          <main className="flex-1 p-4 md:p-6">
            <MealPlanDisplay
              plan={mealPlan}
              startDate={planStartDate ? new Date(planStartDate) : new Date()}
              todayIndex={todayIndex}
              onUpdateMeal={handleUpdateSingleMeal}
              updatingMeal={isUpdatingMeal}
              loading={isGeneratingPlan || isLoading}
            />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
