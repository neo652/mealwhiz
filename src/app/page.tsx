
'use client';

import * as React from 'react';
import { suggestNewMealPlan } from '@/ai/flows/suggest-new-meal-plan';
import type { DailyPlan, Meal, MealItems, MealPlan, MealType } from '@/lib/types';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/Header';
import { MealPlanDisplay } from '@/components/MealPlanDisplay';
import { MealManager } from '@/components/MealManager';
import { useToast } from '@/hooks/use-toast';
import Loading from './loading';
import { getMealItems, saveMealItems } from '@/services/meal-items';
import { getLatestMealPlan, saveMealPlan } from '@/services/meal-plan';
import { differenceInDays, startOfToday } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

function MealWhizContent() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [mealItems, setMealItems] = React.useState<MealItems | null>(null);
  const [mealPlan, setMealPlan] = React.useState<MealPlan | null>(null);
  const [planStartDate, setPlanStartDate] = React.useState<string | null>(null);
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = React.useState(false);
  
  const handleSavePlan = React.useCallback(async (plan: MealPlan, startDate: Date) => {
    if (!user) {
        console.warn("Save requested, but user is not authenticated.");
        return;
    }
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
  }, [toast, user]);

  const handleGenerateNewPlan = React.useCallback(async (currentMealItems: MealItems, isInitial = false) => {
    if (!user || !currentMealItems) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot generate a plan. Please wait a moment and try again.' });
      return;
    }
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
  }, [handleSavePlan, toast, user]);

  React.useEffect(() => {
    async function loadData() {
        if (!user) return; 

        setIsLoading(true);
        try {
            const items = await getMealItems();
            setMealItems(items);
            
            const storedPlanData = await getLatestMealPlan();
            if (storedPlanData && storedPlanData.plan.length > 0) {
                setMealPlan(storedPlanData.plan);
                setPlanStartDate(storedPlanData.startDate);
            } else {
                // If no plan exists, generate one automatically.
                await handleGenerateNewPlan(items, true);
            }
        } catch (error) {
            console.error("Error during initial data load:", error);
            toast({
                variant: 'destructive',
                title: 'Loading Error',
                description: 'Could not load your data. Please refresh the page.',
            });
            setMealPlan(null);
        } finally {
            setIsLoading(false);
        }
    }
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, toast, handleGenerateNewPlan]);

  const handleUpdateSingleMeal = React.useCallback(
    async (dayIndex: number, mealType: MealType, newMeal: Meal) => {
      if (!mealPlan || !planStartDate || !user) return;

      const updatedPlan = JSON.parse(JSON.stringify(mealPlan));
      updatedPlan[dayIndex][mealType] = newMeal;
      
      setMealPlan(updatedPlan);
      await handleSavePlan(updatedPlan, new Date(planStartDate));
     
      toast({
        title: `${mealType} Updated!`,
        description: `'${newMeal}' has been set for ${mealType.toLowerCase()}.`,
      });
    },
    [mealPlan, planStartDate, handleSavePlan, user, toast]
  );

  const handleMealItemsChange = async (newItems: MealItems) => {
    setMealItems(newItems);
     if (!user) {
        console.warn("User not authenticated. Cannot save meal items yet.");
        return;
    }
    try {
      await saveMealItems(newItems);
      toast({
        title: 'Meal List Updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Save Error',
        description: 'Could not save your meal list. Please try again.',
      });
      console.error("Error saving meal items:", error);
    }
  };
  
  if (authLoading || isLoading || !mealPlan || !mealItems) {
    return <Loading />;
  }

  const todayIndex = planStartDate
    ? differenceInDays(startOfToday(), new Date(planStartDate))
    : -1;

  const isDataReady = !authLoading && mealItems && mealPlan;

  return (
    <SidebarProvider>
      <MealManager items={mealItems} onChange={handleMealItemsChange} />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header
            onNewPlanClick={() => mealItems && handleGenerateNewPlan(mealItems)}
            loading={isGeneratingPlan || !isDataReady}
          />
          <main className="flex-1 p-4 md:p-6">
              <MealPlanDisplay
                plan={mealPlan}
                startDate={planStartDate ? new Date(planStartDate) : new Date()}
                todayIndex={todayIndex}
                availableMeals={mealItems}
                onUpdateMeal={handleUpdateSingleMeal}
                loading={isGeneratingPlan || authLoading}
              />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// The main page component that handles the auth state
export default function MealWhizPage() {
    return <MealWhizContent />;
}
