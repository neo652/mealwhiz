'use server';

/**
 * @fileOverview Genkit flow for updating a single meal in a meal plan.
 *
 * - updateSingleMeal -  A function that takes a meal plan, the meal to update and the type of meal, and returns an updated meal plan.
 * - UpdateSingleMealInput - The input type for the updateSingleMeal function.
 * - UpdateSingleMealOutput - The return type for the updateSingleMeal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MealSchema = z.string().describe('A food item for a meal.');

const MealTypeSchema = z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']).describe('The type of meal.');

const DailyMealPlanSchema = z.object({
  date: z.string().describe('The date of the meal plan in YYYY-MM-DD format.'),
  Breakfast: MealSchema,
  Lunch: MealSchema,
  Dinner: MealSchema,
  Snack: MealSchema,
}).describe('A meal plan for a single day.');

const MealPlanSchema = z.array(DailyMealPlanSchema).describe('A meal plan for multiple days.');

const UpdateSingleMealInputSchema = z.object({
  mealPlan: MealPlanSchema,
  dayIndex: z.number().int().min(0).describe('The index of the day to update (0-13 for a two-week plan).'),
  mealType: MealTypeSchema,
  availableMeals: z.array(MealSchema).describe('The list of available meals for the specified meal type.'),
}).describe('Input for updating a single meal in the meal plan.');

export type UpdateSingleMealInput = z.infer<typeof UpdateSingleMealInputSchema>;

const UpdateSingleMealOutputSchema = MealPlanSchema.describe('The updated meal plan.');

export type UpdateSingleMealOutput = z.infer<typeof UpdateSingleMealOutputSchema>;


export async function updateSingleMeal(input: UpdateSingleMealInput): Promise<UpdateSingleMealOutput> {
  return updateSingleMealFlow(input);
}

const updateSingleMealPrompt = ai.definePrompt({
  name: 'updateSingleMealPrompt',
  input: {
    schema: z.object({
      currentMeal: MealSchema,
      mealType: MealTypeSchema,
      availableMeals: z.array(MealSchema),
    }),
  },
  output: {
    schema: MealSchema,
  },
  prompt: `You are a meal suggestion assistant. Your task is to suggest a different meal from the provided list.

Follow these instructions strictly:
1.  You will be given a list of available meals for a specific meal type (e.g., Breakfast).
2.  You will also be given the current meal that needs to be replaced.
3.  Your response MUST be a single meal item from the provided list of available meals.
4.  The suggested meal MUST NOT be the same as the current meal ('{{currentMeal}}').
5.  Pick one item from the list below and return only its name. Do not return any other text.

Available meals for {{mealType}}:
{{#each availableMeals}}
- {{{this}}}
{{/each}}
`,
});

const updateSingleMealFlow = ai.defineFlow(
  {
    name: 'updateSingleMealFlow',
    inputSchema: UpdateSingleMealInputSchema,
    outputSchema: UpdateSingleMealOutputSchema,
  },
  async input => {
    const {
      mealPlan,
      dayIndex,
      mealType,
      availableMeals,
    } = input;

    const currentMeal = mealPlan[dayIndex][mealType];
    const filteredMeals = availableMeals.filter(m => m !== currentMeal);

    let newMeal: string | null = null;
    try {
        const { output } = await updateSingleMealPrompt({
          currentMeal: currentMeal,
          mealType: mealType,
          availableMeals: filteredMeals.length > 0 ? filteredMeals : availableMeals,
        });
        if (output) {
          newMeal = output;
        }
    } catch (e) {
        console.error("Error getting meal suggestion from AI, using fallback.", e);
        // Error is expected if model returns nothing, so we'll fall through to the fallback.
    }
    
    // Create a copy of the meal plan to avoid modifying the original directly
    const updatedMealPlan = JSON.parse(JSON.stringify(mealPlan));

    if (!newMeal) {
        // Fallback: if the model returns nothing, pick a random one from the filtered list.
        const fallbackOptions = filteredMeals.length > 0 ? filteredMeals : availableMeals;
        const fallbackMeal = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        updatedMealPlan[dayIndex][mealType] = fallbackMeal;
        return updatedMealPlan;
    }

    // Update the specific meal in the copied meal plan
    updatedMealPlan[dayIndex][mealType] = newMeal;

    return updatedMealPlan;
  }
);
