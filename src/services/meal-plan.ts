
'use server';

import { collection, doc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MealPlanData } from '@/lib/types';
import { format } from 'date-fns';

const MEAL_PLAN_COLLECTION = 'meal-plans';

export async function getLatestMealPlan(): Promise<MealPlanData | null> {
  try {
    const q = query(collection(db, MEAL_PLAN_COLLECTION), orderBy("startDate", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as MealPlanData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching latest meal plan from Firestore.", error);
    return null;
  }
}

export async function saveMealPlan(mealPlanData: MealPlanData): Promise<void> {
    try {
        const planId = format(new Date(mealPlanData.startDate), 'yyyy-MM-dd');
        const docRef = doc(db, MEAL_PLAN_COLLECTION, planId);
        await setDoc(docRef, mealPlanData);
    } catch(error) {
        console.error("Error saving meal plan to Firestore.", error);
        throw new Error("Could not save meal plan.");
    }
}
