
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { MealItems } from '@/lib/types';
import { INITIAL_MEAL_ITEMS } from '@/lib/data';

const MEAL_ITEMS_COLLECTION = 'meal-data';

export async function getMealItems(): Promise<MealItems> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.warn("User not authenticated yet in getMealItems. Returning initial data.");
      return INITIAL_MEAL_ITEMS;
    }
    
    try {
        const docRef = doc(db, MEAL_ITEMS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as MealItems;
        } else {
            await setDoc(docRef, INITIAL_MEAL_ITEMS);
            return INITIAL_MEAL_ITEMS;
        }
    } catch (error) {
        console.error("Error fetching meal items from Firestore, returning initial data.", error);
        return INITIAL_MEAL_ITEMS;
    }
}

export async function saveMealItems(mealItems: MealItems): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User not authenticated. Cannot save meal items.");
    }

    try {
        const docRef = doc(db, MEAL_ITEMS_COLLECTION, userId);
        await setDoc(docRef, mealItems);
    } catch(error) {
        console.error("Error saving meal items to Firestore.", error);
        throw new Error("Could not save meal items.");
    }
}
