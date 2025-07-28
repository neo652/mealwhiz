'use server';
/**
 * @fileOverview Generates a complete two-week meal plan.
 *
 * - suggestNewMealPlan - A function that generates a new two-week meal plan.
 * - SuggestNewMealPlanInput - The input type for the suggestNewMealPlan function.
 * - SuggestNewMealPlanOutput - The return type for the suggestNewMealPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNewMealPlanInputSchema = z.object({
  breakfastItems: z.array(z.string()).describe('List of breakfast items.'),
  lunchItems: z.array(z.string()).describe('List of lunch items.'),
  dinnerItems: z.array(z.string()).describe('List of dinner items.'),
  snackItems: z.array(z.string()).describe('List of snack items.'),
  numberOfDays: z.number().default(14).describe('Number of days for the meal plan.'),
});
export type SuggestNewMealPlanInput = z.infer<typeof SuggestNewMealPlanInputSchema>;

const DailyMealPlanSchema = z.object({
    Breakfast: z.string().describe('Suggested breakfast item for the day.'),
    Lunch: z.string().describe('Suggested lunch item for the day.'),
    Dinner: z.string().describe('Suggested dinner item for the day.'),
    Snack: z.string().describe('Suggested snack item for the day.'),
});

const SuggestNewMealPlanOutputSchema = z.array(DailyMealPlanSchema);

export type SuggestNewMealPlanOutput = z.infer<typeof SuggestNewMealPlanOutputSchema>;

export async function suggestNewMealPlan(input: SuggestNewMealPlanInput): Promise<SuggestNewMealPlanOutput> {
  return suggestNewMealPlanFlow(input);
}

const suggestNewMealPlanPrompt = ai.definePrompt({
  name: 'suggestNewMealPlanPrompt',
  input: {
    schema: SuggestNewMealPlanInputSchema,
  },
  output: {
    schema: SuggestNewMealPlanOutputSchema,
  },
  prompt: `You are a meal planning assistant. Generate a {{numberOfDays}}-day meal plan.

Available Breakfast Items: {{breakfastItems}}
Available Lunch Items: {{lunchItems}}
Available Dinner Items: {{dinnerItems}}
Available Snack Items: {{snackItems}}

Create a {{numberOfDays}}-day plan where each day has one item from each category. Try not to repeat meals too often.
Return the meal plan as a JSON array of objects. Each object should represent a day and have keys "Breakfast", "Lunch", "Dinner", and "Snack".
`,
});

const suggestNewMealPlanFlow = ai.defineFlow(
  {
    name: 'suggestNewMealPlanFlow',
    inputSchema: SuggestNewMealPlanInputSchema,
    outputSchema: SuggestNewMealPlanOutputSchema,
  },
  async input => {
    const {output} = await suggestNewMealPlanPrompt(input);
    return output!;
  }
);
