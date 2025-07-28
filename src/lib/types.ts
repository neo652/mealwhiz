import {z} from 'genkit';

export type Meal = string;

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  Breakfast: Meal;
  Lunch: Meal;
  Dinner: Meal;
  Snack: Meal;
}

export type MealPlan = DailyPlan[];

export interface MealItems {
  Breakfast: Meal[];
  Lunch: Meal[];
  Dinner: Meal[];
  Snack: Meal[];
}

export interface MealPlanData {
    plan: MealPlan;
    startDate: string;
}

export const UpdateSingleMealInputSchema = z.object({
  availableMeals: z.array(z.string()).describe('List of available meal items.'),
  currentMeal: z.string().describe('The meal item to be replaced.'),
});
export type UpdateSingleMealInput = z.infer<typeof UpdateSingleMealInputSchema>;

export const UpdateSingleMealOutputSchema = z.object({
  meal: z.string().describe('The newly suggested meal item.'),
});
export type UpdateSingleMealOutput = z.infer<typeof UpdateSingleMealOutputSchema>;
