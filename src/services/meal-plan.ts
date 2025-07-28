
'use server';

import { collection, doc, getDocs, limit, orderBy, query, setDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase'; // Import auth
import type { DailyPlan, MealPlan, MealPlanData } from '@/lib/types';
import { addDays, format } from 'date-fns';

const DAILY_MEALS_COLLECTION = 'daily-meals';

export async function getLatestMealPlan(): Promise<MealPlanData | null> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    // We need to query for documents belonging to the current user.
    // This requires a change in data structure to include the userId in daily plan documents.
    // For now, this function will fetch *all* daily plans (which is not ideal for multi-user).
    // A better approach is to have a subcollection of daily plans under each user document.
    // However, to minimize code changes for now, we will fetch and filter client-side (less efficient)
    // OR, ideally, update the data structure and security rules.
    // Let's proceed with the assumption that daily plans will be stored under a user's document
    // in a subcollection called 'dailyPlans'.

    const userDailyPlansCollection = collection(db, 'users', userId, DAILY_MEALS_COLLECTION);

    // Query for the latest 14 daily plans for the user, ordered by date
    const q = query(userDailyPlansCollection, orderBy("date", "desc"), limit(14));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    const dailyPlans: DailyPlan[] = querySnapshot.docs.map(doc => doc.data() as DailyPlan).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (dailyPlans.length === 0) {
        return null;
    }

    return {
        plan: dailyPlans,
        startDate: dailyPlans[0].date
    };
    
  } catch (error) {
    console.error("Error fetching latest meal plan from Firestore.", error);
    return null;
  }
}

export async function saveMealPlan(mealPlanData: MealPlanData): Promise<void> {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        const batch = writeBatch(db);
        const startDate = new Date(mealPlanData.startDate);

        mealPlanData.plan.forEach((dailyPlan, index) => {
            const planDate = addDays(startDate, index);
            const planId = format(planDate, 'yyyy-MM-dd');
            
            // Store daily plans in a subcollection under the user's document
            const docRef = doc(db, 'users', userId, DAILY_MEALS_COLLECTION, planId);
            
            const dataToSave: DailyPlan = {
                date: planId,
                ...dailyPlan
            }
            batch.set(docRef, dataToSave);
        });
        
        await batch.commit();

    } catch(error) {
        console.error("Error saving meal plan to Firestore.", error);
        throw new Error("Could not save meal plan.");
    }
}
