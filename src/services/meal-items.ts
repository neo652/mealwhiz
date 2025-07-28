'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase'; // Import auth
import type { MealItems } from '@/lib/types';
import { INITIAL_MEAL_ITEMS } from '@/lib/data';

const MEAL_ITEMS_COLLECTION = 'meal-data';
// Remove the hardcoded MEAL_ITEMS_DOC_ID

export async function getMealItems(): Promise<MealItems> {
  try {
    const userId = auth.currentUser?.uid; // Get the current user's UID
    if (!userId) {
      throw new Error("User not authenticated"); // Handle the case where the user is not authenticated
    }
    const docRef = doc(db, MEAL_ITEMS_COLLECTION, userId); // Use UID as document ID
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as MealItems;
    } else {
      // No document for this user, so initialize with default items and return them
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
        const userId = auth.currentUser?.uid; // Get the current user's UID
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const docRef = doc(db, MEAL_ITEMS_COLLECTION, userId); // Use UID as document ID
        await setDoc(docRef, mealItems);
    } catch(error) {
        console.error("Error saving meal items to Firestore.", error);
        throw new Error("Could not save meal items.");
    }
}
