'use server';
/**
 * @fileOverview Generates a complete two-week meal plan.
 *
 * - suggestNewMealPlan - A function that generates a new two-week meal plan.
 * - SuggestNewMealPlanInput - The input type for the suggestNewMealPlan function.
 * - SuggestNewMealPlanOutput - The return type for the suggestNewMealPlan function.
 */

import {ai} from '@/ai/genkit';
import { addDays, format } from 'date-fns';
import {z} from 'genkit';

const SuggestNewMealPlanInputSchema = z.object({
  breakfastItems: z.array(z.string()).describe('List of breakfast items.'),
  lunchItems: z.array(z.string()).describe('List of lunch items.'),
  dinnerItems: z.array(z.string()).describe('List of dinner items.'),
  snackItems: z.array(z.string()).describe('List of snack items.'),
  numberOfDays: z.number().default(14).describe('Number of days for the meal plan.'),
  startDate: z.string().describe('The start date for the meal plan in ISO format.'),
});
export type SuggestNewMealPlanInput = z.infer<typeof SuggestNewMealPlanInputSchema>;

const DailyMealPlanSchema = z.object({
    date: z.string().describe('The date for this meal plan in YYYY-MM-DD format.'),
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
    schema: z.object({
        breakfastItems: z.array(z.string()),
        lunchItems: z.array(z.string()),
        dinnerItems: z.array(z.string()),
        snackItems: z.array(z.string()),
        numberOfDays: z.number(),
    })
  },
  output: {
    schema: z.array(z.object({
        Breakfast: z.string().describe('Suggested breakfast item for the day.'),
        Lunch: z.string().describe('Suggested lunch item for the day.'),
        Dinner: z.string().describe('Suggested dinner item for the day.'),
        Snack: z.string().describe('Suggested snack item for the day.'),
    })),
  },
  prompt: `You are a meal planning assistant. Your task is to generate a {{numberOfDays}}-day meal plan using ONLY the items provided.

Follow these instructions strictly:
1.  You will be given lists of available items for Breakfast, Lunch, Dinner, and Snacks.
2.  For each day in the plan, you MUST select one item from each list for the corresponding meal type.
3.  Do not use any meal items that are not in the provided lists.
4.  Try not to repeat meals too often within the {{numberOfDays}}-day period.
5.  Return the meal plan as a JSON array of objects. Each object must represent a day and have keys "Breakfast", "Lunch", "Dinner", and "Snack".

Available Breakfast Items:
{{#each breakfastItems}}
- {{{this}}}
{{/each}}

Available Lunch Items:
{{#each lunchItems}}
- {{{this}}}
{{/each}}

Available Dinner Items:
{{#each dinnerItems}}
- {{{this}}}
{{/each}}

Available Snack Items:
{{#each snackItems}}
- {{{this}}}
{{/each}}
`,
});

const suggestNewMealPlanFlow = ai.defineFlow(
  {
    name: 'suggestNewMealPlanFlow',
    inputSchema: SuggestNewMealPlanInputSchema,
    outputSchema: SuggestNewMealPlanOutputSchema,
  },
  async (input) => {
    const { output } = await suggestNewMealPlanPrompt({
        breakfastItems: input.breakfastItems,
        lunchItems: input.lunchItems,
        dinnerItems: input.dinnerItems,
        snackItems: input.snackItems,
        numberOfDays: input.numberOfDays,
    });
    if (!output) {
      throw new Error('Failed to generate meal plan.');
    }

    const startDate = new Date(input.startDate);
    const datedPlan = output.map((day, index) => {
      const date = addDays(startDate, index);
      return {
        ...day,
        date: format(date, 'yyyy-MM-dd'),
      };
    });

    return datedPlan;
  }
);
