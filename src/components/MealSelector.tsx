
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Meal, MealType } from '@/lib/types';

interface MealSelectorProps {
  mealType: MealType;
  availableMeals: Meal[];
  currentMeal: Meal;
  onMealSelect: (newMeal: Meal) => void;
}

export function MealSelector({
  availableMeals,
  currentMeal,
  onMealSelect,
  mealType
}: MealSelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Select another ${mealType}`}
          className="text-muted-foreground hover:text-primary"
        >
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="end">
        <Command>
          <CommandInput placeholder={`Search ${mealType.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {availableMeals.map(meal => (
                <CommandItem
                  key={meal}
                  value={meal}
                  onSelect={(selectedValue) => {
                    const newMeal = availableMeals.find(m => m.toLowerCase() === selectedValue.toLowerCase()) || currentMeal;
                    onMealSelect(newMeal);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentMeal.toLowerCase() === meal.toLowerCase() ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {meal}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
