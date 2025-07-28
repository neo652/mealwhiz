export type Meal = string;

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface DailyPlan {
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
