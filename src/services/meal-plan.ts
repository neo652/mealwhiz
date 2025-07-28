
'use server';

import { collection, doc, getDocs, limit, orderBy, query, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { DailyPlan, MealPlan, MealPlanData } from '@/lib/types';

const DAILY_MEALS_COLLECTION = 'daily-meals';

export async function getLatestMealPlan(): Promise<MealPlanData | null> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
       console.warn("User not authenticated yet in getLatestMealPlan. Returning null.");
      return null;
    }
    
    try {
        const userDailyPlansCollection = collection(db, 'users', userId, DAILY_MEALS_COLLECTION);

        const q = query(userDailyPlansCollection, orderBy("date", "asc"), limit(14));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }
        
        const dailyPlans: DailyPlan[] = querySnapshot.docs.map(doc => doc.data() as DailyPlan);

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
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.warn("User not authenticated. Cannot save meal plan.");
        // Instead of throwing, we just return. The UI should prevent this.
        return;
    }
    
    try {
        const batch = writeBatch(db);
        
        mealPlanData.plan.forEach((dailyPlan) => {
            const planId = dailyPlan.date;
            
            const docRef = doc(db, 'users', userId, DAILY_MEALS_COLLECTION, planId);
            
            const dataToSave: DailyPlan = {
                ...dailyPlan,
                date: planId,
            }
            batch.set(docRef, dataToSave, { merge: true });
        });
        
        await batch.commit();

    } catch(error) {
        console.error("Error saving meal plan to Firestore.", error);
        throw new Error("Could not save meal plan.");
    }
}

    
