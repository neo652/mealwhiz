'use server';
/**
 * @fileOverview Suggests a single new meal item.
 *
 * - updateSingleMeal - A function that suggests a different meal.
 * - UpdateSingleMealInput - The input type for the updateSingleMeal function.
 * - UpdateSingleMealOutput - The return type for the updateSingleMeal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { UpdateSingleMealInputSchema, UpdateSingleMealOutputSchema, type UpdateSingleMealInput, type UpdateSingleMealOutput } from '@/lib/types';


export async function updateSingleMeal(input: UpdateSingleMealInput): Promise<UpdateSingleMealOutput> {
  return updateSingleMealFlow(input);
}

const updateSingleMealPrompt = ai.definePrompt({
  name: 'updateSingleMealPrompt',
  input: {
    schema: UpdateSingleMealInputSchema,
  },
  output: {
    schema: UpdateSingleMealOutputSchema,
  },
  prompt: `You are a meal suggestion assistant.
Your task is to suggest a new meal from the list of available meals, making sure it is different from the current meal.

Available Meals:
{{#each availableMeals}}
- {{{this}}}
{{/each}}

Current Meal to Replace: {{{currentMeal}}}

Instructions:
1.  Review the list of "Available Meals".
2.  Select ONE meal from the list that is NOT the "Current Meal to Replace".
3.  If there is only one available meal and it is the same as the current meal, you may return the same meal.
4.  Return the suggestion in the specified JSON format with the key "meal".
`,
});

const updateSingleMealFlow = ai.defineFlow(
  {
    name: 'updateSingleMealFlow',
    inputSchema: UpdateSingleMealInputSchema,
    outputSchema: UpdateSingleMealOutputSchema,
  },
  async (input) => {
    // If only one option is available, the LLM might not have a choice.
    // Let's handle this case to avoid unnecessary LLM calls if possible.
    const alternateMeals = input.availableMeals.filter(m => m !== input.currentMeal);
    if (alternateMeals.length === 1) {
      return { meal: alternateMeals[0] };
    }
    // If no other options, just return the current one.
    if (alternateMeals.length === 0) {
      return { meal: input.currentMeal };
    }

    const { output } = await updateSingleMealPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a meal suggestion.');
    }
    return output;
  }
);
