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

    const prompt = ai.definePrompt({
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
      prompt: `Given the following list of available meals for {{mealType}}:

      {{#each availableMeals}}
      - {{{this}}}
      {{/each}}

      Suggest a different meal to replace the current meal. The new meal must not be '{{currentMeal}}'.

      Current meal: {{{currentMeal}}}
      `,
    });

    const { output: newMeal } = await prompt({
      currentMeal: mealPlan[dayIndex][mealType],
      mealType: mealType,
      availableMeals: availableMeals.filter(m => m !== mealPlan[dayIndex][mealType]),
    });

    // Create a copy of the meal plan to avoid modifying the original directly
    const updatedMealPlan = JSON.parse(JSON.stringify(mealPlan));

    // Update the specific meal in the copied meal plan
    updatedMealPlan[dayIndex][mealType] = newMeal!;

    return updatedMealPlan;
  }
);
