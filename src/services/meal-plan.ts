
'use server';

import { collection, doc, getDocs, limit, orderBy, query, setDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { DailyPlan, MealPlan, MealPlanData } from '@/lib/types';

const DAILY_MEALS_COLLECTION = 'daily-meals';

export async function getLatestMealPlan(): Promise<MealPlanData | null> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      // This can happen if called before auth is complete, return null and let the UI handle it.
       console.warn("User not authenticated yet in getLatestMealPlan. Returning null.");
      return null;
    }
    
    try {
        const userDailyPlansCollection = collection(db, 'users', userId, DAILY_MEALS_COLLECTION);

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
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User not authenticated. Cannot save meal plan.");
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
