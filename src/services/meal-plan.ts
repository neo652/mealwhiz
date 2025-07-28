
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MealPlanData } from '@/lib/types';

const MEAL_PLAN_COLLECTION = 'meal-plans';
const MEAL_PLAN_DOC_ID = 'current-plan';

export async function getMealPlan(): Promise<MealPlanData | null> {
  try {
    const docRef = doc(db, MEAL_PLAN_COLLECTION, MEAL_PLAN_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as MealPlanData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching meal plan from Firestore.", error);
    return null;
  }
}

export async function saveMealPlan(mealPlanData: MealPlanData): Promise<void> {
    try {
        const docRef = doc(db, MEAL_PLAN_COLLECTION, MEAL_PLAN_DOC_ID);
        await setDoc(docRef, mealPlanData);
    } catch(error) {
        console.error("Error saving meal plan to Firestore.", error);
        throw new Error("Could not save meal plan.");
    }
}
