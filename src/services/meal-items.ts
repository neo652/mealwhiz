'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MealItems } from '@/lib/types';
import { INITIAL_MEAL_ITEMS } from '@/lib/data';

const MEAL_ITEMS_COLLECTION = 'meal-data';
const MEAL_ITEMS_DOC_ID = 'user-items';

export async function getMealItems(): Promise<MealItems> {
  try {
    const docRef = doc(db, MEAL_ITEMS_COLLECTION, MEAL_ITEMS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as MealItems;
    } else {
      // No document, so initialize with default items and return them
      await setDoc(docRef, INITIAL_MEAL_ITEMS);
      return INITIAL_MEAL_ITEMS;
    }
  } catch (error) {
    console.error("Error fetching meal items from Firestore, returning initial data.", error);
    // On error, return the initial data as a fallback
    return INITIAL_MEAL_ITEMS;
  }
}

export async function saveMealItems(mealItems: MealItems): Promise<void> {
    try {
        const docRef = doc(db, MEAL_ITEMS_COLLECTION, MEAL_ITEMS_DOC_ID);
        await setDoc(docRef, mealItems);
    } catch(error) {
        console.error("Error saving meal items to Firestore.", error);
        throw new Error("Could not save meal items.");
    }
}
