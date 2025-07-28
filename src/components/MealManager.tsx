'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import type { MealItems, MealType } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

interface MealManagerProps {
  items: MealItems;
  onChange: (newItems: MealItems) => void;
}

const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function MealManager({ items, onChange }: MealManagerProps) {
  const [newItems, setNewItems] = React.useState<MealItems>(items);
  const [newItemInputs, setNewItemInputs] = React.useState<
    Record<MealType, string>
  >({
    Breakfast: '',
    Lunch: '',
    Dinner: '',
    Snack: '',
  });

  React.useEffect(() => {
    setNewItems(items);
  }, [items]);

  const handleAddItem = (mealType: MealType) => {
    const newItem = newItemInputs[mealType].trim();
    if (newItem && !newItems[mealType].includes(newItem)) {
      const updatedItems = {
        ...newItems,
        [mealType]: [...newItems[mealType], newItem],
      };
      setNewItems(updatedItems);
      onChange(updatedItems);
      setNewItemInputs(prev => ({ ...prev, [mealType]: '' }));
    }
  };

  const handleRemoveItem = (mealType: MealType, itemToRemove: string) => {
    const updatedItems = {
      ...newItems,
      [mealType]: newItems[mealType].filter(item => item !== itemToRemove),
    };
    setNewItems(updatedItems);
    onChange(updatedItems);
  };

  const handleInputChange = (mealType: MealType, value: string) => {
    setNewItemInputs(prev => ({ ...prev, [mealType]: value }));
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <UtensilsCrossed className="h-6 w-6" />
          <h2 className="text-lg font-semibold font-headline">Manage Meals</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <Tabs defaultValue="Breakfast" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 h-auto flex-wrap sm:grid-cols-4 mx-auto px-2">
            {mealTypes.map(type => (
              <TabsTrigger key={type} value={type}>
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
          {mealTypes.map(type => (
            <TabsContent key={type} value={type} className="flex-1 overflow-hidden mt-0">
              <div className="p-4 flex flex-col h-full">
                <form
                  className="flex items-center gap-2 mb-4"
                  onSubmit={e => {
                    e.preventDefault();
                    handleAddItem(type);
                  }}
                >
                  <Input
                    placeholder="Add new item..."
                    value={newItemInputs[type]}
                    onChange={e => handleInputChange(type, e.target.value)}
                  />
                  <Button type="submit" size="icon" aria-label="Add item">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>
                <ScrollArea className="flex-1">
                  <ul className="space-y-2 pr-4">
                    {newItems[type].map(item => (
                      <li
                        key={item}
                        className="flex items-center justify-between gap-2 p-2 rounded-md bg-secondary text-secondary-foreground"
                      >
                        <span className="truncate flex-1">{item}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(type, item)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          aria-label={`Remove ${item}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SidebarContent>
      <SidebarFooter>
        <p className="text-xs text-muted-foreground p-4 text-center">
          Your meal list is saved automatically.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
